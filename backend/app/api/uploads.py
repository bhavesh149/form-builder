from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from app.models.user import User
from app.services import upload_service
from app.auth.deps import get_current_user

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/webm", "video/quicktime",
}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
):
    """Upload a file (image/video) to Cloudinary."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' not allowed. Allowed: {', '.join(ALLOWED_TYPES)}",
        )

    # Check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB",
        )

    # Reset file position for the upload service
    await file.seek(0)

    try:
        result = await upload_service.upload_file(file)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
