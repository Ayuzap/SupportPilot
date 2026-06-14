from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest
from services.db import get_pool
from services.moss_client import query_index
from services.gemini_client import get_diagnostic_response
import uuid
import json

router = APIRouter()

def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(val)
        return True
    except ValueError:
        return False

@router.post("/chat")
@router.post("/diagnose")  # alias to support diagnose directly
async def chat(request: ChatRequest):
    if not is_valid_uuid(request.product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    pool = await get_pool()
    async with pool.acquire() as conn:
        product = await conn.fetchrow("SELECT * FROM products WHERE id=$1", uuid.UUID(request.product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        product_name = product["name"]
        messages = []
        session_id = request.session_id

        if session_id:
            try:
                session = await conn.fetchrow(
                    "SELECT * FROM chat_sessions WHERE id=$1", uuid.UUID(session_id)
                )
                if session:
                    messages = json.loads(session["messages"]) if isinstance(session["messages"], str) else (session["messages"] or [])
            except Exception:
                # If session_id is not a valid UUID or not found, fall back to new session
                session_id = None

        retrieved_chunks = await query_index(request.product_id, request.message)

        reply = await get_diagnostic_response(
            product_name=product_name,
            retrieved_chunks=retrieved_chunks,
            conversation_history=messages,
            user_message=request.message
        )

        messages.append({"role": "user", "content": request.message})
        messages.append({"role": "model", "content": reply})

        if session_id:
            await conn.execute("""
                UPDATE chat_sessions SET messages=$1, updated_at=NOW() WHERE id=$2
            """, json.dumps(messages), uuid.UUID(session_id))
        else:
            session_id = str(uuid.uuid4())
            await conn.execute("""
                INSERT INTO chat_sessions (id, product_id, messages)
                VALUES ($1, $2, $3)
            """, uuid.UUID(session_id), uuid.UUID(request.product_id), json.dumps(messages))

        sources = [
            {
                "doc_name": chunk["metadata"].get("doc_name", ""),
                "page": chunk["metadata"].get("page", ""),
                "score": chunk.get("score", 0)
            }
            for chunk in retrieved_chunks
        ]

        return {"session_id": session_id, "reply": reply, "sources": sources}
