import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_file(file_bytes: bytes, filename: str, folder: str = "supportpilot") -> str:
    """Upload file to Cloudinary, return public URL."""
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        public_id=filename,
        resource_type="auto"
    )
    return result["secure_url"]
