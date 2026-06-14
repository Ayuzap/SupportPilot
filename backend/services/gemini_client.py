import os
from google import genai
from google.genai import types

SYSTEM_PROMPT = """You are an expert support technician for {product_name}. Your job is to quickly and confidently help users resolve issues.

CORE BEHAVIOR:
1. ALWAYS lead with the most likely fix based on the product documentation below. Do not interrogate the user before giving useful information.
2. You are expected to know how the product works. Do NOT ask the user to explain basic product features or how they activate them — use your knowledge and the documentation.
3. After giving your best answer, you may ask ONE focused follow-up question if you genuinely need more information to narrow down the root cause (e.g., "Does the issue persist after trying these steps?").
4. If the documentation covers the issue, cite it clearly (e.g., "According to the manual..."). If it doesn't, say so and give your best general guidance.
5. Format any step-by-step instructions as a markdown checklist so users can track progress:
   - [ ] Step one
   - [ ] Step two
6. Keep responses concise and conversational. No walls of text.
7. If an issue is potentially dangerous, warn the user FIRST.
8. Never ask the user questions about how to operate the product's basic features — you should already know this.

OFFICIAL PRODUCT DOCUMENTATION:
{retrieved_context}

If the documentation doesn't cover the reported issue, say so briefly and offer your best general guidance anyway.
"""

def build_context_string(chunks: list[dict]) -> str:
    if not chunks:
        return "No documentation available for this product yet."
    parts = []
    for chunk in chunks:
        doc_name = chunk["metadata"].get("doc_name", "Unknown")
        page = chunk["metadata"].get("page", "")
        page_str = f" (Page {page})" if page else ""
        parts.append(f"[{doc_name}{page_str}]\n{chunk['content']}")
    return "\n\n---\n\n".join(parts)

async def get_diagnostic_response(
    product_name: str,
    retrieved_chunks: list[dict],
    conversation_history: list[dict],
    user_message: str
) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or "your_gemini_api_key" in api_key:
        return "The AI assistant is not configured yet. Please add your GEMINI_API_KEY to backend/.env to enable diagnostics."

    try:
        client = genai.Client(api_key=api_key)

        context = build_context_string(retrieved_chunks)
        system = SYSTEM_PROMPT.format(product_name=product_name, retrieved_context=context)

        # Build conversation contents for the new SDK
        contents = []
        for msg in conversation_history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system),
        )
        return response.text
    except Exception as e:
        err = str(e)
        print(f"Gemini error (full): {e}")
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            return (
                "The AI assistant has temporarily hit its usage limit. "
                "Please wait a moment and try again, or check your Gemini API quota at https://ai.dev/rate-limit."
            )
        if "400" in err or "API_KEY_INVALID" in err or "invalid" in err.lower():
            return f"Gemini API key error: {err[:200]}"
        return f"AI error: {err[:300]}"
