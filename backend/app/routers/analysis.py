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

from ml.predictor import get_predictor

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
    model_used: str


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

    # ── Run analysis ──────────────────────────────────────────────────────
    predictor   = get_predictor()
    result      = predictor.analyse_image(image_bytes, handedness=handedness)
    model_label = "ml_model" if predictor.model_ready else "rule_based"

    return AnalysisResult(
        success    = result["success"],
        error      = result.get("error"),
        scores     = ScoreMap(**result["scores"]) if result.get("scores") else None,
        features   = result.get("features"),
        tips       = result.get("tips"),
        grade      = result.get("grade"),
        model_used = model_label,
    )


@router.get("/model-status")
def model_status():
    """Return information about the currently loaded model."""
    predictor = get_predictor()
    return {
        "model_ready":    predictor.model_ready,
        "scoring_method": "ml_model" if predictor.model_ready else "rule_based",
        "label_cols":     predictor._label_cols,
        "tip": (
            None if predictor.model_ready
            else "Run  python -m ml.train_model  from the backend/ directory to train."
        ),
    }
