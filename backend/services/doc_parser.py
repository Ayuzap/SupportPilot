import fitz

def parse_pdf(file_bytes: bytes, doc_name: str) -> list[dict]:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    chunks = []
    chunk_size = 500
    overlap = 50

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text().strip()
        if not text:
            continue
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end].strip()
            if chunk:
                chunks.append({
                    "content": chunk,
                    "metadata": {"doc_name": doc_name, "page": str(page_num + 1)}
                })
            start = end - overlap

    doc.close()
    return chunks

def parse_text(text: str, doc_name: str) -> list[dict]:
    chunks = []
    chunk_size = 500
    overlap = 50
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append({
                "content": chunk,
                "metadata": {"doc_name": doc_name, "page": "1"}
            })
        start = end - overlap
    return chunks
