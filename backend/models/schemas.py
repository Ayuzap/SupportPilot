from pydantic import BaseModel
from typing import Optional, List

class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str  # 'company' or 'user'
    company_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    product_id: str
    session_id: Optional[str] = None
    message: str

class DocumentLinkRequest(BaseModel):
    name: str
    url: str

class ProductCreateRequest(BaseModel):
    name: str
    category: str
    model: Optional[str] = None
    description: Optional[str] = ""
    status: Optional[str] = "Live"
    commonIssues: Optional[List[str]] = []
    metrics: Optional[dict] = {"openTickets": 0, "aiAssistRate": "80%", "docCoverage": "0 articles"}

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    model: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    commonIssues: Optional[List[str]] = None
    metrics: Optional[dict] = None
