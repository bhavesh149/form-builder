import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from loguru import logger

from app.config import get_settings

settings = get_settings()

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


async def upload_file(file: UploadFile, folder: str = "humanity-forms") -> dict:
    """Upload a file to Cloudinary and return the result."""
    try:
        contents = await file.read()

        # Determine resource type based on content type
        resource_type = "auto"
        if file.content_type and file.content_type.startswith("video"):
            resource_type = "video"

        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type=resource_type,
            public_id=file.filename.rsplit(".", 1)[0] if file.filename else None,
        )

        logger.info(f"Uploaded file to Cloudinary: {result['secure_url']}")

        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "resource_type": result["resource_type"],
            "format": result.get("format", ""),
            "bytes": result.get("bytes", 0),
        }
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {str(e)}")
        raise ValueError(f"File upload failed: {str(e)}")
