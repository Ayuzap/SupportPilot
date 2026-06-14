import asyncpg
import os
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
from dotenv import load_dotenv

_pool = None

def _clean_db_url(url: str) -> str:
    """Remove asyncpg-incompatible query params like channel_binding."""
    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)
    # asyncpg does not support channel_binding; remove it
    params.pop("channel_binding", None)
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    cleaned = parsed._replace(query=clean_query)
    return urlunparse(cleaned)

async def get_pool():
    global _pool
    if _pool is None:
        # Re-load .env in case the process started before the file was written
        load_dotenv(override=True)
        db_url = os.getenv("DATABASE_URL", "")
        if not db_url or "your_neon_connection_string" in db_url or "postgresql://user:pass" in db_url:
            raise ValueError("DATABASE_URL is not properly configured in backend/.env")
        clean_url = _clean_db_url(db_url)
        _pool = await asyncpg.create_pool(clean_url, ssl="require")
    return _pool

async def init_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT CHECK (role IN ('company', 'user')) NOT NULL,
                company_name TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                company_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                category TEXT,
                model TEXT,
                description TEXT,
                status TEXT DEFAULT 'Live',
                image_url TEXT,
                common_issues JSONB DEFAULT '[]',
                metrics JSONB DEFAULT '{"openTickets": 0, "aiAssistRate": "80%", "docCoverage": "0 articles"}',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID REFERENCES products(id) ON DELETE CASCADE,
                name TEXT,
                type TEXT CHECK (type IN ('pdf', 'text', 'image', 'video', 'link')),
                url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS chat_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID REFERENCES products(id) ON DELETE CASCADE,
                user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
                messages JSONB DEFAULT '[]',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)
