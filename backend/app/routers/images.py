"""
routers/images.py
------------------
FastAPI router for image management.

Endpoints
---------
GET /api/images
    Returns a list of all uploaded images with their metadata.

GET /api/images/{image_id}
    Returns details of a specific image by ID.

DELETE /api/images/{image_id}
    Deletes an image by ID.
"""

from fastapi import APIRouter, HTTPException, Response
from typing import List
from app.database import images_collection
from app.schemas.images import ImageResponse, ImagesListResponse

router = APIRouter(prefix="/images", tags=["images"])


def format_file_size(size_in_bytes: int) -> str:
    """Format file size in human readable format."""
    if size_in_bytes < 1024:
        return f"{size_in_bytes} B"
    elif size_in_bytes < 1024 * 1024:
        return f"{size_in_bytes / 1024:.1f} KB"
    else:
        return f"{size_in_bytes / (1024 * 1024):.1f} MB"


def format_uploaded_at(uploaded_at) -> str:
    """Format uploaded_at datetime to readable string."""
    if not uploaded_at:
        return "Unknown"
    from datetime import datetime
    if isinstance(uploaded_at, datetime):
        return uploaded_at.strftime("%b %d, %Y %I:%M %p")
    return str(uploaded_at)


@router.get("", response_model=ImagesListResponse)
async def get_images():
    """Get all uploaded images."""
    try:
        images_cursor = images_collection.find().sort("uploaded_at", -1)
        images = []

        for img in images_cursor:
            uploaded_at_value = img.get("uploaded_at")
            uploaded_at_iso = None
            if hasattr(uploaded_at_value, "isoformat"):
                uploaded_at_iso = uploaded_at_value.isoformat()
            elif uploaded_at_value is not None:
                uploaded_at_iso = str(uploaded_at_value)

            images.append(ImageResponse(
                id=str(img["_id"]),
                filename=img.get("filename", "Unknown"),
                player=img.get("player"),
                size=format_file_size(img.get("size", 0)),
                content_type=img.get("content_type", "Unknown"),
                uploaded_at=format_uploaded_at(uploaded_at_value),
                uploaded_at_iso=uploaded_at_iso,
                status=img.get("status", "unknown"),
                analysis=img.get("analysis"),
                score=img.get("score"),
                grade=img.get("grade"),
                model_used=img.get("model_used"),
                error=img.get("error")
            ))

        return ImagesListResponse(images=images)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve images: {exc}"
        )


@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(image_id: str):
    """Get a specific image by ID."""
    try:
        img = images_collection.find_one({"_id": image_id})
        if not img:
            raise HTTPException(status_code=404, detail="Image not found")

        uploaded_at_value = img.get("uploaded_at")
        uploaded_at_iso = None
        if hasattr(uploaded_at_value, "isoformat"):
            uploaded_at_iso = uploaded_at_value.isoformat()
        elif uploaded_at_value is not None:
            uploaded_at_iso = str(uploaded_at_value)

        return ImageResponse(
            id=str(img["_id"]),
            filename=img.get("filename", "Unknown"),
            player=img.get("player"),
            size=format_file_size(img.get("size", 0)),
            content_type=img.get("content_type", "Unknown"),
            uploaded_at=format_uploaded_at(uploaded_at_value),
            uploaded_at_iso=uploaded_at_iso,
            status=img.get("status", "unknown"),
            analysis=img.get("analysis"),
            score=img.get("score"),
            grade=img.get("grade"),
            model_used=img.get("model_used"),
            error=img.get("error")
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve image: {exc}"
        )


@router.delete("/{image_id}")
async def delete_image(image_id: str):
    """Delete an image by ID."""
    try:
        result = images_collection.delete_one({"_id": image_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")

        return {"detail": "Image deleted successfully", "id": image_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete image: {exc}"
        )


@router.get("/{image_id}/data")
async def get_image_data(image_id: str):
    """Get the actual image data for display."""
    try:
        img = images_collection.find_one({"_id": image_id})
        if not img:
            raise HTTPException(status_code=404, detail="Image not found")

        image_data = img.get("image_data")
        content_type = img.get("content_type", "image/jpeg")

        if not image_data:
            raise HTTPException(status_code=404, detail="Image data not found")

        return Response(content=image_data, media_type=content_type)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve image data: {exc}"
        )