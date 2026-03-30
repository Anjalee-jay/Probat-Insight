from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from pymongo.errors import PyMongoError

from app.database import users_collection
from app.schemas.users import (
    ManagedUser,
    UserCreateRequest,
    UserDeleteResponse,
    UserMutationResponse,
    UsersListResponse,
    UsersResetResponse,
    UserUpdateRequest,
)

router = APIRouter(prefix="/users", tags=["users"])


def _build_initials(name: str) -> str:
    parts = [part for part in name.strip().split(" ") if part]
    if len(parts) == 0:
        return "US"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[1][0]}".upper()


def _normalize_role(role: str | None) -> str:
    normalized = (role or "User").strip().lower()
    mapping = {
        "admin": "Admin",
        "analyst": "Analyst",
        "coach": "Coach",
        "player": "Player",
        "user": "User",
        "super admin": "Admin",
    }
    return mapping.get(normalized, normalized.title() or "User")


def _format_joined(value) -> str:
    if isinstance(value, str) and value.strip():
        return value
    if isinstance(value, datetime):
        joined_at = value
    else:
        joined_at = datetime.now(timezone.utc)
    return joined_at.strftime("%b %d, %Y")


def _serialize_user(user_doc: dict) -> ManagedUser:
    return ManagedUser(
        id=str(user_doc.get("_id", "")),
        name=user_doc.get("name", "Unknown User"),
        email=user_doc.get("email", "unknown@probat.com"),
        role=_normalize_role(user_doc.get("role")),
        initials=user_doc.get("initials") or _build_initials(user_doc.get("name", "Unknown User")),
        active=bool(user_doc.get("active", True)),
        analyses=max(int(user_doc.get("analyses", 0) or 0), 0),
        joined=_format_joined(user_doc.get("joined") or user_doc.get("created_at")),
        avatar=user_doc.get("avatar") or None,
    )


def _get_user_or_404(user_id: str) -> dict:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user_doc = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_doc


@router.get("", response_model=UsersListResponse)
def list_users():
    try:
        user_docs = list(users_collection.find({}).sort("created_at", -1))
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    return UsersListResponse(users=[_serialize_user(user_doc) for user_doc in user_docs])


@router.post("", response_model=UserMutationResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreateRequest):
    normalized_email = payload.email.lower()

    try:
        existing_user = users_collection.find_one({"email": normalized_email})
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": payload.name.strip(),
        "email": normalized_email,
        "role": _normalize_role(payload.role),
        "initials": _build_initials(payload.name),
        "active": payload.active,
        "analyses": payload.analyses,
        "joined": _format_joined(now),
        "created_at": now,
        "updated_at": now,
        "managed_via_admin": True,
    }

    try:
        result = users_collection.insert_one(user_doc)
        created_user = users_collection.find_one({"_id": result.inserted_id})
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    return UserMutationResponse(detail="User created successfully", user=_serialize_user(created_user))


@router.put("/{user_id}", response_model=UserMutationResponse)
def update_user(user_id: str, payload: UserUpdateRequest):
    try:
        current_user = _get_user_or_404(user_id)
        normalized_email = payload.email.lower()
        duplicate_user = users_collection.find_one({
            "email": normalized_email,
            "_id": {"$ne": current_user["_id"]},
        })
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    if duplicate_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    updates = {
        "name": payload.name.strip(),
        "email": normalized_email,
        "role": _normalize_role(payload.role),
        "initials": _build_initials(payload.name),
        "active": payload.active,
        "analyses": payload.analyses,
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        users_collection.update_one({"_id": current_user["_id"]}, {"$set": updates})
        updated_user = users_collection.find_one({"_id": current_user["_id"]})
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    return UserMutationResponse(detail="User updated successfully", user=_serialize_user(updated_user))


@router.delete("/reset", response_model=UsersResetResponse)
def reset_users():
    try:
        result = users_collection.delete_many({"managed_via_admin": True})
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    return UsersResetResponse(detail="All users cleared successfully", deleted_count=result.deleted_count)


@router.delete("/{user_id}", response_model=UserDeleteResponse)
def delete_user(user_id: str):
    try:
        current_user = _get_user_or_404(user_id)
        users_collection.delete_one({"_id": current_user["_id"]})
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    return UserDeleteResponse(detail="User deleted successfully", id=user_id)
