from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime


class ImageCreateRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    player: Optional[str] = Field(default=None, max_length=100)
    size: int = Field(ge=0)
    content_type: str = Field(min_length=1, max_length=50)
    image_data: bytes
    handedness: str = Field(default="right", pattern="^(right|left)$")


class ImageResponse(BaseModel):
    id: str
    filename: str
    player: Optional[str]
    size: str  # Formatted size
    content_type: str
    uploaded_at: str
    uploaded_at_iso: Optional[str] = None
    status: str = Field(default="processing")
    analysis: Optional[Dict] = None
    score: Optional[float] = None
    grade: Optional[str] = None
    model_used: Optional[str] = None
    error: Optional[str] = None


class ImagesListResponse(BaseModel):
    images: List[ImageResponse]


class ImageAnalysisUpdate(BaseModel):
    status: str
    analysis: Optional[Dict] = None
    score: Optional[float] = None
    grade: Optional[str] = None
    model_used: Optional[str] = None
    error: Optional[str] = None