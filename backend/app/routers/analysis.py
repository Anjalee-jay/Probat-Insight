"""
routers/analysis.py
-------------------
FastAPI router for batting image analysis.

Endpoints
---------
POST /api/analysis/upload
    Accepts a multipart image upload, runs the full ML pipeline,
    and returns structured batting analysis results.

GET  /api/analysis/model-status
    Returns whether a trained model is loaded or rule-based scoring is active.
"""

from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import uuid
from datetime import datetime

from app.database import images_collection, analysis_collection
from app.schemas.images import ImageCreateRequest, ImageResponse

# Lazy import to avoid initialization at module level
_predictor = None
_predictor_error = None

def get_predictor():
    global _predictor, _predictor_error
    if _predictor is not None:
        return _predictor
    if _predictor_error is not None:
        raise _predictor_error

    try:
        from ml.predictor import get_predictor as _get_predictor
        _predictor = _get_predictor()
        return _predictor
    except Exception as exc:
        _predictor_error = HTTPException(
            status_code=503,
            detail=(
                "Batting analysis is unavailable because the backend ML dependencies are missing "
                f"or this environment: {exc}. "
                "Install the backend requirements and restart the server."
            ),
        )
        raise _predictor_error

def derive_player_from_filename(filename: str) -> Optional[str]:
    """Derive player name from filename by cleaning and formatting."""
    import re
    if not filename:
        return None
    base = re.sub(r'\.[^/.]+$', '', filename)
    cleaned = re.sub(r'[._-]+', ' ', base).strip()
    if not cleaned:
        return None
    return " ".join(
        word.capitalize()
        for word in cleaned.split()
        if word
    )[:100]  # Limit to 100 chars

router = APIRouter(prefix="/analysis", tags=["analysis"])

# ── Response schemas ──────────────────────────────────────────────────────────

class ScoreMap(BaseModel):
    stance:       float
    grip_hands:   float
    back_lift:    float
    elbow_angle:  float
    head_position: float
    overall:      float


class AnalysisResult(BaseModel):
    success:    bool
    error:      Optional[str]
    scores:     Optional[ScoreMap]
    features:   Optional[Dict[str, float]]
    tips:       Optional[Dict[str, List[str]]]
    grade:      Optional[str]
    stroke:     Optional[str]
    stroke_confidence: Optional[float]
    model_used: str
    image_id:   Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=AnalysisResult)
async def analyse_upload(
    file:       UploadFile = File(..., description="Batting image (JPEG / PNG / WebP)"),
    handedness: str        = Form(default="right", description='"right" or "left"'),
):
    """
    Upload a batting image for analysis.

    Returns scores (0–100) for:
      • Stance
      • Grip & Hands
      • Back Lift
      • Elbow Angle
      • Head Position
      • Overall

    Plus improvement tips and a letter grade.
    """
    # ── Validate file type ────────────────────────────────────────────────
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    ct = (file.content_type or "").lower()
    if ct not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ct}'. "
                   f"Accepted: {', '.join(sorted(allowed_types))}",
        )

    # ── Validate handedness ───────────────────────────────────────────────
    if handedness not in ("right", "left"):
        raise HTTPException(
            status_code=422,
            detail="handedness must be 'right' or 'left'.",
        )

    # ── Read image bytes ──────────────────────────────────────────────────
    MAX_SIZE = 15 * 1024 * 1024   # 15 MB
    image_bytes = await file.read()
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(image_bytes) // (1024*1024)} MB). Max 15 MB.",
        )

    # ── Generate image_id and save to database ───────────────────────────
    image_id = str(uuid.uuid4())
    player_name = derive_player_from_filename(file.filename)

    image_doc = {
        "_id": image_id,
        "filename": file.filename,
        "player": player_name,
        "size": len(image_bytes),
        "content_type": ct,
        "image_data": image_bytes,
        "handedness": handedness,
        "uploaded_at": datetime.utcnow(),
        "status": "processing",
        "analysis": None,
        "score": None,
        "grade": None,
        "model_used": None,
        "error": None
    }

    try:
        images_collection.insert_one(image_doc)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save image to database: {exc}",
        )

    # ── Run analysis ──────────────────────────────────────────────────────
    predictor   = get_predictor()
    result      = predictor.analyse_image(image_bytes, handedness=handedness)
    model_label = "ml_model" if predictor.model_ready else "rule_based"

    # ── Update database with analysis results ────────────────────────────
    update_data = {
        "status": "completed" if result["success"] else "failed",
        "analysis": result if result["success"] else None,
        "score": result.get("scores", {}).get("overall") if result.get("scores") else None,
        "grade": result.get("grade"),
        "model_used": model_label,
        "error": result.get("error") if not result["success"] else None
    }

    try:
        images_collection.update_one(
            {"_id": image_id},
            {"$set": update_data}
        )
    except Exception as exc:
        # Log error but don't fail the response
        print(f"Failed to update analysis results in images_collection: {exc}")

    # ── Also save to analysis_collection for admin dashboard ──────────────
    try:
        analysis_doc = {
            "image_id": image_id,
            "filename": file.filename,
            "player": player_name,
            "status": "completed" if result["success"] else "failed",
            "scores": result.get("scores", {}) if result.get("scores") else None,
            "features": result.get("features", {}),
            "tips": result.get("tips", {}),
            "grade": result.get("grade"),
            "stroke": result.get("stroke"),
            "stroke_confidence": result.get("stroke_confidence"),
            "model_used": model_label,
            "error": result.get("error") if not result["success"] else None,
            "handedness": handedness,
            "analyzed_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        # Insert into analysis collection
        analysis_collection.insert_one(analysis_doc)
    except Exception as exc:
        # Log error but don't fail the response - analysis_collection is not critical for immediate feedback
        print(f"Failed to save analysis to analysis_collection: {exc}")

    return AnalysisResult(
        success    = result["success"],
        error      = result.get("error"),
        scores     = ScoreMap(**result["scores"]) if result.get("scores") else None,
        features   = result.get("features"),
        tips       = result.get("tips"),
        grade      = result.get("grade"),
        stroke     = result.get("stroke"),
        stroke_confidence = result.get("stroke_confidence"),
        model_used = model_label,
        image_id   = image_id,
    )


@router.get("/model-status")
def model_status():
    """Return information about the currently loaded model."""
    try:
        predictor = get_predictor()
    except HTTPException as exc:
        return {
            "model_ready": False,
            "stroke_model_ready": False,
            "scoring_method": "unavailable",
            "stroke_method": "unavailable",
            "label_cols": [],
            "stroke_labels": [],
            "tip": str(exc.detail),
            "error": exc.detail,
        }

    return {
        "model_ready":       predictor.model_ready,
        "stroke_model_ready": predictor._stroke_pipeline is not None,
        "scoring_method":    "ml_model" if predictor.model_ready else "rule_based",
        "stroke_method":     "ml_model" if predictor._stroke_pipeline is not None else "rule_based",
        "label_cols":        predictor._label_cols,
        "stroke_labels":     predictor._stroke_labels,
        "tip": (
            None if predictor.model_ready
            else "Run  python -m ml.train_model  from the backend/ directory to train."
        ),
    }
