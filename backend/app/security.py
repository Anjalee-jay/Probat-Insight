import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status, Header
from jose import jwt
from passlib.context import CryptContext
from pymongo.errors import PyMongoError

from app.database import users_collection

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

# Use pbkdf2_sha256 instead of bcrypt to avoid compatibility issues
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    # Truncate password to 72 bytes as a safety measure
    if len(password.encode('utf-8')) > 72:
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    """Dependency to get current authenticated user from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization token")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization token")

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email = str(payload.get("sub") or "").lower().strip()
        role = str(payload.get("role") or "user").lower().strip()
    except jwt.JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc

    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    try:
        user_doc = users_collection.find_one({"email": email})
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    # Handle fallback admin
    if user_doc is None and email == os.getenv("FALLBACK_ADMIN_EMAIL", "admin@gmail.com").lower():
        user_doc = {
            "name": "Admin User",
            "email": email,
            "role": "admin",
            "initials": "AD",
            "dob": None,
            "gender": None,
            "phone": None,
            "avatar": None,
        }

    if user_doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Add role to user doc for convenience
    user_doc["role"] = user_doc.get("role", "user")
    return user_doc


def require_role(required_roles: List[str]):
    """Create a dependency that requires specific roles."""
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role", "user").lower()
        if user_role not in [role.lower() for role in required_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(required_roles)}"
            )
        return current_user
    return role_checker


# Pre-defined role dependencies for common use cases
require_admin = require_role(["admin"])
require_admin_or_analyst = require_role(["admin", "analyst"])
require_any_authenticated = require_role(["admin", "analyst", "coach", "player", "user"])
