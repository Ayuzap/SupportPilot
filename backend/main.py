from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, products, documents, assistant
from services.db import init_db


app = FastAPI(title="SupportPilot API")

# Configure CORS to allow frontend connections on 5173 or 5174 ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        await init_db()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Database initialization warning (make sure database credentials are set): {e}")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(documents.router, tags=["documents"])
app.include_router(assistant.router, prefix="/assistant", tags=["assistant"])

@app.get("/health")
def health():
    return {"status": "ok"}
