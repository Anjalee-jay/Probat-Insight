import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
from pymongo.errors import PyMongoError

from app.database import users_collection
from app.schemas.auth import AuthResponse, AuthUser, LoginRequest, RegisterRequest
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

load_dotenv()
FALLBACK_ADMIN_EMAIL = os.getenv("FALLBACK_ADMIN_EMAIL", "admin@probat.com").lower()
FALLBACK_ADMIN_PASSWORD = os.getenv("FALLBACK_ADMIN_PASSWORD", "admin123")


def _build_initials(name: str) -> str:
    parts = [part for part in name.strip().split(" ") if part]
    if len(parts) == 0:
        return "US"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[1][0]}".upper()


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest):
    try:
        existing_user = users_collection.find_one({"email": payload.email.lower()})
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        )

    normalized_role = "admin" if payload.role.lower() == "admin" else "user"
    user_doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "role": normalized_role,
        "initials": _build_initials(payload.name),
        "dob": payload.dob,
        "gender": payload.gender,
        "phone": payload.phone,
        "avatar": payload.avatar,
    }
    try:
        users_collection.insert_one(user_doc)
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    user = AuthUser(
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        initials=user_doc["initials"],
        dob=user_doc.get("dob"),
        gender=user_doc.get("gender"),
        phone=user_doc.get("phone"),
        avatar=user_doc.get("avatar"),
    )
    token = create_access_token({"sub": user.email, "role": user.role})
    return AuthResponse(access_token=token, user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    normalized_email = payload.email.lower()

    try:
        user_doc = users_collection.find_one({"email": normalized_email})
    except PyMongoError:
        user_doc = None

    if user_doc:
        if not verify_password(payload.password, user_doc["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        user = AuthUser(
            name=user_doc["name"],
            email=user_doc["email"],
            role=user_doc.get("role", "user"),
            initials=user_doc.get("initials") or _build_initials(user_doc["name"]),
            dob=user_doc.get("dob"),
            gender=user_doc.get("gender"),
            phone=user_doc.get("phone"),
            avatar=user_doc.get("avatar"),
        )
        token = create_access_token({"sub": user.email, "role": user.role})
        return AuthResponse(access_token=token, user=user)

    if normalized_email == FALLBACK_ADMIN_EMAIL and payload.password == FALLBACK_ADMIN_PASSWORD:
        fallback_admin = AuthUser(
            name="Admin User",
            email=FALLBACK_ADMIN_EMAIL,
            role="admin",
            initials="AD",
        )
        token = create_access_token({"sub": fallback_admin.email, "role": fallback_admin.role})
        return AuthResponse(access_token=token, user=fallback_admin)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
    )
