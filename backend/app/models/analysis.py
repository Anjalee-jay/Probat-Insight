from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from bson import ObjectId


class AnalysisModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    image_id: str
    player: Optional[str] = None
    filename: str
    status: str = "processing"
    scores: Optional[Dict[str, float]] = None
    features: Optional[Dict[str, float]] = None
    tips: Optional[Dict[str, List[str]]] = None
    grade: Optional[str] = None
    stroke: Optional[str] = None
    stroke_confidence: Optional[float] = None
    model_used: str = "unknown"
    error: Optional[str] = None
    handedness: str = "right"
    analyzed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

    @classmethod
    def from_doc(cls, doc: dict) -> "AnalysisModel":
        """Create model instance from MongoDB document."""
        if "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        return cls(**doc)

    def to_doc(self) -> dict:
        """Convert model to MongoDB document."""
        doc = self.dict(by_alias=True, exclude_unset=True)
        if "id" in doc:
            doc["_id"] = ObjectId(doc["id"])
            del doc["id"]
        return doc