from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: str = Field(default="user")
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class AuthUser(BaseModel):
    name: str
    email: EmailStr
    role: str
    initials: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser
