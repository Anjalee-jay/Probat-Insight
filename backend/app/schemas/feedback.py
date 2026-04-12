from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    rating: int = Field(ge=1, le=5)
    message: str = Field(min_length=1, max_length=2000)


class FeedbackCreateResponse(BaseModel):
    detail: str
    id: str
    created_at: datetime
