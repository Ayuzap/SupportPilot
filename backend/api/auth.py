from fastapi import APIRouter, HTTPException
from models.schemas import RegisterRequest, LoginRequest
from services.db import get_pool
from services.auth_utils import hash_password, verify_password, create_token
import uuid

router = APIRouter()

@router.post("/register")
async def register(data: RegisterRequest):
    # Map frontend 'customer' to db 'user'
    db_role = "user" if data.role == "customer" else data.role
    if db_role not in ["company", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM profiles WHERE email=$1", data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = str(uuid.uuid4())
        await conn.execute("""
            INSERT INTO profiles (id, email, password_hash, role, company_name)
            VALUES ($1, $2, $3, $4, $5)
        """, user_id, data.email, hash_password(data.password), db_role,
            data.company_name if db_role == "company" else None)

        token = create_token(user_id, data.role)
        return {"access_token": token, "role": data.role}

@router.post("/login")
async def login(data: LoginRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT * FROM profiles WHERE email=$1", data.email)
        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Map db 'user' to frontend 'customer'
        frontend_role = "customer" if user["role"] == "user" else user["role"]

        token = create_token(str(user["id"]), frontend_role)
        return {
            "access_token": token,
            "role": frontend_role,
            "user": {"id": str(user["id"]), "email": user["email"], "company_name": user["company_name"]}
        }
