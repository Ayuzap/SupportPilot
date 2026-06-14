import os
import httpx
from moss import MossClient, DocumentInfo, QueryOptions

_client = None

def get_moss():
    global _client
    if _client is None:
        _client = MossClient(
            os.getenv("MOSS_PROJECT_ID"),
            os.getenv("MOSS_PROJECT_KEY")
        )
    return _client

def _moss_configured() -> bool:
    project_id = os.getenv("MOSS_PROJECT_ID", "")
    return bool(project_id) and "your_moss_project_id" not in project_id

async def index_chunks(product_id: str, chunks: list[dict]):
    if not _moss_configured():
        print("MOSS is not configured. Skipping indexing.")
        return
    client = get_moss()
    index_name = "supportpilot-docs"
    docs = []
    for i, chunk in enumerate(chunks):
        metadata = dict(chunk["metadata"])
        metadata["product_id"] = str(product_id)
        # Ensure all metadata values are strings as required by MOSS SDK
        for k, v in metadata.items():
            metadata[k] = str(v)
        docs.append(
            DocumentInfo(
                id=f"{product_id}-{chunk['metadata']['doc_name']}-{i}",
                text=chunk["content"],
                metadata=metadata
            )
        )
    try:
        try:
            await client.load_index(index_name)
            await client.add_docs(index_name, docs)
        except Exception:
            await client.create_index(index_name, docs)
        print(f"MOSS: indexed {len(docs)} chunks into '{index_name}' for product {product_id}")
    except Exception as e:
        print(f"MOSS index error: {e}")
        raise RuntimeError(f"MOSS indexing failed: {e}") from e

async def query_index(product_id: str, query: str, top_k: int = 5) -> list[dict]:
    if not _moss_configured():
        print("MOSS is not configured. Skipping query.")
        return []
    client = get_moss()
    index_name = "supportpilot-docs"
    try:
        await client.load_index(index_name)
        opts = QueryOptions(
            top_k=top_k,
            filter={"field": "product_id", "condition": {"$eq": str(product_id)}}
        )
        results = await client.query(index_name, query, opts)
        chunks = [
            {"content": r.text, "metadata": r.metadata, "score": r.score}
            for r in results.docs
        ]
        print(f"MOSS: query '{query[:60]}' returned {len(chunks)} chunks from '{index_name}' for product {product_id}")
        return chunks
    except Exception as e:
        print(f"MOSS query error for index '{index_name}': {e}")
        return []

async def reindex_product(product_id: str, documents: list[dict]) -> dict:
    """
    Re-download and re-index all PDF/text documents for a product.
    `documents` is a list of dicts with keys: id, name, type, url
    Returns a summary: {"indexed": int, "skipped": int, "errors": list[str]}
    """
    from services.doc_parser import parse_pdf, parse_text

    if not _moss_configured():
        return {"indexed": 0, "skipped": len(documents), "errors": ["MOSS is not configured"]}

    indexed = 0
    skipped = 0
    errors = []

    for doc in documents:
        doc_type = doc.get("type", "")
        url = doc.get("url", "")
        name = doc.get("name", "unknown")

        if doc_type not in ("pdf", "text") or not url:
            skipped += 1
            continue

        try:
            async with httpx.AsyncClient(timeout=30) as http:
                response = await http.get(url)
                response.raise_for_status()
                file_bytes = response.content

            if doc_type == "pdf":
                chunks = parse_pdf(file_bytes, name)
            else:
                chunks = parse_text(file_bytes.decode("utf-8", errors="replace"), name)

            await index_chunks(product_id, chunks)
            indexed += 1
            print(f"Re-indexed '{name}': {len(chunks)} chunks")
        except Exception as e:
            err = f"Failed to re-index '{name}': {e}"
            print(err)
            errors.append(err)

    return {"indexed": indexed, "skipped": skipped, "errors": errors}

async def delete_index(product_id: str):
    if not _moss_configured():
        return
    client = get_moss()
    index_name = "supportpilot-docs"
    try:
        await client.load_index(index_name)
        all_docs = await client.get_docs(index_name)
        to_delete = [
            doc.id for doc in all_docs
            if doc.metadata and doc.metadata.get("product_id") == str(product_id)
        ]
        if to_delete:
            await client.delete_docs(index_name, to_delete)
            print(f"MOSS: deleted {len(to_delete)} documents for product {product_id} from '{index_name}'")
    except Exception as e:
        print(f"MOSS delete error for product {product_id}: {e}")


