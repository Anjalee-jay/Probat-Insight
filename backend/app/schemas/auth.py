from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def validate_login_email_lowercase(cls, value: EmailStr) -> EmailStr:
        email = str(value)
        if any(ch.isupper() for ch in email):
            raise ValueError("Email must be lowercase only")
        return value

    @field_validator("password")
    @classmethod
    def validate_login_password(cls, value: str) -> str:
        if value.strip() != value:
            raise ValueError("Password cannot start or end with spaces")
        return value


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    role: str = Field(default="user")
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_register_email_lowercase(cls, value: EmailStr) -> EmailStr:
        email = str(value)
        if any(ch.isupper() for ch in email):
            raise ValueError("Email must be lowercase only")
        return value

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 2:
            raise ValueError("Name must contain at least 2 characters")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if value.strip() != value:
            raise ValueError("Password cannot start or end with spaces")
        if not any(ch.isalpha() for ch in value):
            raise ValueError("Password must include at least one letter")
        if not any(ch.isdigit() for ch in value):
            raise ValueError("Password must include at least one number")
        return value

    @field_validator("dob")
    @classmethod
    def validate_dob(cls, value: Optional[str]) -> Optional[str]:
        if not value:
            return value

        try:
            dob = date.fromisoformat(value)
        except ValueError as exc:
            raise ValueError("Date of birth must be in YYYY-MM-DD format") from exc

        if dob > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return value

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None

        normalized = value.lower().strip()
        if normalized not in {"male", "female", "other"}:
            raise ValueError("Gender must be one of: male, female, other")
        return normalized

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None

        normalized = value.strip()
        compact = normalized.replace(" ", "")
        if compact.startswith("+"):
            compact = compact[1:]
        if not compact.isdigit() or not 10 <= len(compact) <= 15:
            raise ValueError("Phone must contain 10 to 15 digits")
        return normalized


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email_lowercase(cls, value: EmailStr) -> EmailStr:
        email = str(value)
        if any(ch.isupper() for ch in email):
            raise ValueError("Email must be lowercase only")
        return value

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 2:
            raise ValueError("Name must contain at least 2 characters")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None

        normalized = value.strip()
        compact = normalized.replace(" ", "")
        if compact.startswith("+"):
            compact = compact[1:]
        if not compact.isdigit() or not 10 <= len(compact) <= 15:
            raise ValueError("Phone must contain 10 to 15 digits")
        return normalized


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
