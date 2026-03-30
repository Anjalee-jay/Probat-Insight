from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from pymongo.errors import PyMongoError

from app.database import contact_messages_collection
from app.schemas.contact import ContactCreateRequest, ContactCreateResponse

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactCreateResponse, status_code=status.HTTP_201_CREATED)
def create_contact_message(payload: ContactCreateRequest):
    now = datetime.now(timezone.utc)
    message_doc = {
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "message": payload.message.strip(),
        "created_at": now,
    }

    try:
        result = contact_messages_collection.insert_one(message_doc)
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please configure MongoDB and try again.",
        )

    return ContactCreateResponse(
        detail="Message sent successfully",
        id=str(result.inserted_id),
        created_at=now,
    )
