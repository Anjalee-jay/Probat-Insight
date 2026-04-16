from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime


class ScoreMap(BaseModel):
    stance: float = Field(ge=0, le=100)
    grip_hands: float = Field(ge=0, le=100)
    back_lift: float = Field(ge=0, le=100)
    elbow_angle: float = Field(ge=0, le=100)
    head_position: float = Field(ge=0, le=100)
    overall: float = Field(ge=0, le=100)


class AnalysisCreate(BaseModel):
    image_id: str = Field(min_length=1)
    player: Optional[str] = Field(default=None, max_length=100)
    filename: str = Field(min_length=1, max_length=255)
    status: str = Field(default="processing", pattern="^(processing|completed|failed|pending)$")
    scores: Optional[ScoreMap] = None
    features: Optional[Dict[str, float]] = None
    tips: Optional[Dict[str, List[str]]] = None
    grade: Optional[str] = Field(default=None, max_length=5)
    stroke: Optional[str] = Field(default=None, max_length=50)
    stroke_confidence: Optional[float] = Field(default=None, ge=0, le=1)
    model_used: str = Field(default="unknown", max_length=50)
    error: Optional[str] = None
    handedness: str = Field(default="right", pattern="^(right|left)$")
    analyzed_at: Optional[datetime] = None


class AnalysisResponse(BaseModel):
    id: str
    image_id: str
    player: Optional[str]
    filename: str
    status: str
    scores: Optional[ScoreMap]
    features: Optional[Dict[str, float]]
    tips: Optional[Dict[str, List[str]]]
    grade: Optional[str]
    stroke: Optional[str]
    stroke_confidence: Optional[float]
    model_used: str
    error: Optional[str]
    handedness: str
    analyzed_at: Optional[str]
    created_at: str


class AnalysisUpdate(BaseModel):
    status: Optional[str] = Field(default=None, pattern="^(processing|completed|failed|pending)$")
    scores: Optional[ScoreMap] = None
    features: Optional[Dict[str, float]] = None
    tips: Optional[Dict[str, List[str]]] = None
    grade: Optional[str] = None
    stroke: Optional[str] = None
    stroke_confidence: Optional[float] = None
    model_used: Optional[str] = None
    error: Optional[str] = None


class AnalysisListResponse(BaseModel):
    analyses: List[AnalysisResponse]
    total: int
    page: int
    page_size: int