from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from pymongo.errors import PyMongoError

from app.database import feedbacks_collection
from app.schemas.feedback import FeedbackCreateRequest, FeedbackCreateResponse

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackCreateResponse, status_code=status.HTTP_201_CREATED)
def create_feedback(payload: FeedbackCreateRequest):
    now = datetime.now(timezone.utc)
    feedback_doc = {
        "name": payload.name.strip(),
        "rating": payload.rating,
        "message": payload.message.strip(),
        "created_at": now,
    }

    try:
        result = feedbacks_collection.insert_one(feedback_doc)
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please try again later.",
        )

    return FeedbackCreateResponse(
        detail="Feedback submitted successfully",
        id=str(result.inserted_id),
        created_at=now,
    )
