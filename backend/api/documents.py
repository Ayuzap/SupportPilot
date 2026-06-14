from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from services.db import get_pool
from services.auth_utils import require_company
from services.storage import upload_file
from services.doc_parser import parse_pdf, parse_text
from services.moss_client import index_chunks
import uuid

router = APIRouter()

def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(val)
        return True
    except ValueError:
        return False

def format_doc(row):
    d = dict(row)
    if "product_id" in d and d["product_id"]:
        d["product_id"] = str(d["product_id"])
    if "id" in d and d["id"]:
        d["id"] = str(d["id"])
    if "created_at" in d and d["created_at"]:
        d["updatedAt"] = d["created_at"].strftime("%Y-%m-%d")
        # Keep updatedAt to match frontend expectations
        d["updatedAt"] = d["created_at"].strftime("%Y-%m-%d")
    return d

@router.get("/products/{product_id}/documents")
async def list_documents(product_id: str):
    if not is_valid_uuid(product_id):
        return []  # Return empty array for mock product fallback
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM documents WHERE product_id=$1 ORDER BY created_at", uuid.UUID(product_id)
        )
        return [format_doc(r) for r in rows]

@router.post("/products/{product_id}/documents")
async def upload_document(
    product_id: str,
    file: UploadFile = File(None),
    url: str = Form(None),
    name: str = Form(None),
    user=Depends(require_company)
):
    if not is_valid_uuid(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    pool = await get_pool()
    async with pool.acquire() as conn:
        product = await conn.fetchrow("SELECT id FROM products WHERE id=$1", uuid.UUID(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if file and file.filename:
            file_bytes = await file.read()
            file_ext = file.filename.split(".")[-1].lower()
            try:
                public_url = upload_file(file_bytes, f"{uuid.uuid4()}-{file.filename}", folder="supportpilot/docs")
            except Exception as e:
                print(f"Cloudinary upload failed: {e}. Falling back to placeholder URL.")
                public_url = "https://res.cloudinary.com/placeholder-large-file.pdf"

            doc_type = (
                "pdf" if file_ext == "pdf" else
                "text" if file_ext == "txt" else
                "image" if file_ext in ["png","jpg","jpeg"] else
                "video"
            )

            row = await conn.fetchrow("""
                INSERT INTO documents (product_id, name, type, url)
                VALUES ($1, $2, $3, $4) RETURNING *
            """, uuid.UUID(product_id), file.filename, doc_type, public_url)

            if file_ext == "pdf":
                chunks = parse_pdf(file_bytes, file.filename)
                await index_chunks(product_id, chunks)
            elif file_ext == "txt":
                chunks = parse_text(file_bytes.decode("utf-8"), file.filename)
                await index_chunks(product_id, chunks)

            return format_doc(row)

        elif url:
            row = await conn.fetchrow("""
                INSERT INTO documents (product_id, name, type, url)
                VALUES ($1, $2, 'link', $3) RETURNING *
            """, uuid.UUID(product_id), name or url, url)
            return format_doc(row)

        raise HTTPException(status_code=400, detail="Provide a file or URL")

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, user=Depends(require_company)):
    if not is_valid_uuid(doc_id):
        raise HTTPException(status_code=404, detail="Document not found")
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM documents WHERE id=$1", uuid.UUID(doc_id))
        return {"message": "Document deleted"}
