import os

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException, status
from jose import JWTError, jwt
from pymongo.errors import PyMongoError

from app.database import users_collection
from app.schemas.auth import AuthResponse, AuthUser, LoginRequest, ProfileUpdateRequest, RegisterRequest
from app.security import JWT_ALGORITHM, JWT_SECRET_KEY, create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

load_dotenv()
FALLBACK_ADMIN_EMAIL = os.getenv("FALLBACK_ADMIN_EMAIL", "admin@gmail.com").lower()
FALLBACK_ADMIN_PASSWORD = os.getenv("FALLBACK_ADMIN_PASSWORD", "Admin123#@$")


def _build_initials(name: str) -> str:
    parts = [part for part in name.strip().split(" ") if part]
    if len(parts) == 0:
        return "US"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[1][0]}".upper()


def _auth_user_from_token(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization token")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization token")

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email = str(payload.get("sub") or "").lower().strip()
    except JWTError as exc:
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

    # If fallback admin logged in without a DB row, bootstrap one so settings can persist.
    if user_doc is None and email == FALLBACK_ADMIN_EMAIL:
        user_doc = {
            "name": "Admin User",
            "email": FALLBACK_ADMIN_EMAIL,
            "role": "admin",
            "initials": "AD",
            "dob": None,
            "gender": None,
            "phone": None,
            "avatar": None,
        }
        try:
            users_collection.insert_one(user_doc)
            user_doc = users_collection.find_one({"email": email})
        except PyMongoError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable. Please configure MongoDB and try again.",
            )

    if user_doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user_doc


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


@router.put("/profile", response_model=AuthUser)
def update_profile(payload: ProfileUpdateRequest, authorization: str | None = Header(default=None)):
    current_user = _auth_user_from_token(authorization)
    normalized_email = payload.email.lower()

    try:
        duplicate_user = users_collection.find_one(
            {
                "email": normalized_email,
                "_id": {"$ne": current_user["_id"]},
            }
        )
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    if duplicate_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    updates = {
        "name": payload.name,
        "email": normalized_email,
        "initials": _build_initials(payload.name),
        "phone": payload.phone,
    }

    try:
        users_collection.update_one({"_id": current_user["_id"]}, {"$set": updates})
        updated_user = users_collection.find_one({"_id": current_user["_id"]})
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    if updated_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return AuthUser(
        name=updated_user["name"],
        email=updated_user["email"],
        role=updated_user.get("role", "user"),
        initials=updated_user.get("initials") or _build_initials(updated_user["name"]),
        dob=updated_user.get("dob"),
        gender=updated_user.get("gender"),
        phone=updated_user.get("phone"),
        avatar=updated_user.get("avatar"),
    )
