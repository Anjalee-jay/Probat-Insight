from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class ContactCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    message: str = Field(min_length=5, max_length=2000)


class ContactCreateResponse(BaseModel):
    detail: str
    id: str
    created_at: datetime
