from fastapi import APIRouter, HTTPException, Depends
from services.db import get_pool
from services.auth_utils import require_company
from services.moss_client import delete_index
from models.schemas import ProductCreateRequest, ProductUpdateRequest
import json
import uuid

router = APIRouter()

def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(val)
        return True
    except ValueError:
        return False

def format_product(row):
    d = dict(row)
    if "company_name" in d:
        d["company"] = d["company_name"]
    if "common_issues" in d:
        issues = d.pop("common_issues")
        # Handle string JSON loading or leave as is
        d["commonIssues"] = json.loads(issues) if isinstance(issues, str) else (issues or [])
    if "metrics" in d:
        metrics = d["metrics"]
        metrics = json.loads(metrics) if isinstance(metrics, str) else (metrics or {})
        if "doc_count" in d:
            count = d["doc_count"]
            metrics["docCoverage"] = f"{count} document{'s' if count != 1 else ''}"
        d["metrics"] = metrics
    if "created_at" in d and d["created_at"]:
        d["lastUpdated"] = d["created_at"].strftime("%Y-%m-%d")
    if "company_id" in d and d["company_id"]:
        d["company_id"] = str(d["company_id"])
    if "id" in d and d["id"]:
        d["id"] = str(d["id"])
    return d

@router.get("")
async def list_products(search: str = "", category: str = ""):
    pool = await get_pool()
    async with pool.acquire() as conn:
        query = """
            SELECT p.*, pr.company_name, COUNT(d.id) as doc_count
            FROM products p
            JOIN profiles pr ON p.company_id = pr.id
            LEFT JOIN documents d ON d.product_id = p.id
            WHERE ($1 = '' OR p.name ILIKE $1)
            AND ($2 = '' OR $2 = 'All' OR p.category = $2)
            GROUP BY p.id, pr.company_name
            ORDER BY p.created_at DESC
        """
        rows = await conn.fetch(query, f"%{search}%" if search else "", category)
        return [format_product(r) for r in rows]

@router.get("/mine")
async def my_products(user=Depends(require_company)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT p.*, COUNT(d.id) as doc_count, pr.company_name
            FROM products p
            JOIN profiles pr ON p.company_id = pr.id
            LEFT JOIN documents d ON d.product_id = p.id
            WHERE p.company_id = $1
            GROUP BY p.id, pr.company_name
            ORDER BY p.created_at DESC
        """, uuid.UUID(user["sub"]))
        return [format_product(r) for r in rows]

@router.get("/{product_id}")
async def get_product(product_id: str):
    if not is_valid_uuid(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT p.*, pr.company_name
            FROM products p
            JOIN profiles pr ON p.company_id = pr.id
            WHERE p.id = $1
        """, uuid.UUID(product_id))
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_dict = format_product(row)
        
        doc_rows = await conn.fetch("""
            SELECT * FROM documents WHERE product_id = $1 ORDER BY created_at
        """, uuid.UUID(product_id))
        
        docs = []
        for r in doc_rows:
            d = dict(r)
            docs.append({
                "id": str(d["id"]),
                "title": d["name"] or "Document",
                "type": "Manual" if d["type"] in ["pdf", "text"] else (d["type"].capitalize() if d["type"] else "Manual"),
                "format": d["type"].upper() if d["type"] else "PDF",
                "updatedAt": d["created_at"].strftime("%Y-%m-%d") if d["created_at"] else "",
                "url": d["url"]
            })
            
        product_dict["documents"] = docs
        if "metrics" in product_dict:
            product_dict["metrics"]["docCoverage"] = f"{len(docs)} document{'s' if len(docs) != 1 else ''}"
        return product_dict

@router.post("")
async def create_product(
    data: ProductCreateRequest,
    user=Depends(require_company)
):
    pool = await get_pool()
    product_id = str(uuid.uuid4())
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO products (id, company_id, name, category, model, description, status, common_issues, metrics)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        """, uuid.UUID(product_id), uuid.UUID(user["sub"]), data.name, data.category, data.model,
            data.description, data.status, json.dumps(data.commonIssues), json.dumps(data.metrics))
        return format_product(row)

@router.put("/{product_id}")
async def update_product(
    product_id: str,
    data: ProductUpdateRequest,
    user=Depends(require_company)
):
    if not is_valid_uuid(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT * FROM products WHERE id=$1 AND company_id=$2", uuid.UUID(product_id), uuid.UUID(user["sub"])
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")

        name = data.name if data.name is not None else existing["name"]
        category = data.category if data.category is not None else existing["category"]
        model = data.model if data.model is not None else existing["model"]
        description = data.description if data.description is not None else existing["description"]
        status = data.status if data.status is not None else existing["status"]
        
        common_issues_val = existing["common_issues"]
        if data.commonIssues is not None:
            common_issues_val = json.dumps(data.commonIssues)
            
        metrics_val = existing["metrics"]
        if data.metrics is not None:
            metrics_val = json.dumps(data.metrics)

        row = await conn.fetchrow("""
            UPDATE products SET
                name = $1,
                category = $2,
                model = $3,
                description = $4,
                status = $5,
                common_issues = $6,
                metrics = $7
            WHERE id=$8 RETURNING *
        """, name, category, model, description, status, common_issues_val, metrics_val, uuid.UUID(product_id))
        return format_product(row)

@router.delete("/{product_id}")
async def delete_product(product_id: str, user=Depends(require_company)):
    if not is_valid_uuid(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM products WHERE id=$1 AND company_id=$2", uuid.UUID(product_id), uuid.UUID(user["sub"])
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")
        await delete_index(product_id)
        await conn.execute("DELETE FROM products WHERE id=$1", uuid.UUID(product_id))
        return {"message": "Product deleted"}
