"""
routers/analysis_crud.py
------------------------
FastAPI router for Analysis collection CRUD operations.

Endpoints
---------
GET /api/analysis/
    Get all analyses with pagination and filtering

GET /api/analysis/{analysis_id}
    Get a specific analysis by ID

POST /api/analysis/
    Create a new analysis record

PUT /api/analysis/{analysis_id}
    Update an existing analysis

DELETE /api/analysis/{analysis_id}
    Delete an analysis

GET /api/analysis/stats
    Get analysis statistics for admin dashboard
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.database import analysis_collection
from app.models.analysis import AnalysisModel
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisResponse,
    AnalysisUpdate,
    AnalysisListResponse
)
from app.security import require_admin

router = APIRouter(prefix="/analysis", tags=["analysis-crud"])


def analysis_to_response(analysis: dict) -> AnalysisResponse:
    """Convert analysis document to response model."""
    analysis["id"] = str(analysis["_id"])
    del analysis["_id"]
    if analysis.get("analyzed_at"):
        analysis["analyzed_at"] = analysis["analyzed_at"].isoformat()
    analysis["created_at"] = analysis["created_at"].isoformat()
    return AnalysisResponse(**analysis)


@router.get("/", response_model=AnalysisListResponse)
async def get_analyses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    player: Optional[str] = Query(None, description="Filter by player name"),
    stroke: Optional[str] = Query(None, description="Filter by detected stroke"),
    grade: Optional[str] = Query(None, description="Filter by grade"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order")
):
    """Get paginated list of analyses with optional filtering."""
    # Build filter query
    filter_query = {}
    if status:
        filter_query["status"] = status
    if player:
        filter_query["player"] = {"$regex": player, "$options": "i"}
    if stroke:
        filter_query["stroke"] = {"$regex": stroke, "$options": "i"}
    if grade:
        filter_query["grade"] = grade

    # Calculate skip
    skip = (page - 1) * page_size

    # Build sort
    sort_direction = 1 if sort_order == "asc" else -1
    sort_query = [(sort_by, sort_direction)]

    try:
        # Get total count
        total = analysis_collection.count_documents(filter_query)

        # Get paginated results
        cursor = analysis_collection.find(filter_query).sort(sort_query).skip(skip).limit(page_size)
        analyses = list(cursor)

        # Convert to response format
        analysis_responses = [analysis_to_response(analysis) for analysis in analyses]

        return AnalysisListResponse(
            analyses=analysis_responses,
            total=total,
            page=page,
            page_size=page_size
        )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analyses: {exc}")


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str):
    """Get a specific analysis by ID."""
    try:
        analysis = analysis_collection.find_one({"_id": ObjectId(analysis_id)})
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        return analysis_to_response(analysis)

    except Exception as exc:
        if "404" in str(exc):
            raise exc
        raise HTTPException(status_code=500, detail=f"Failed to fetch analysis: {exc}")


@router.post("/", response_model=AnalysisResponse)
async def create_analysis(analysis_data: AnalysisCreate):
    """Create a new analysis record."""
    try:
        # Create analysis document
        analysis_doc = {
            "image_id": analysis_data.image_id,
            "player": analysis_data.player,
            "filename": analysis_data.filename,
            "status": analysis_data.status,
            "scores": analysis_data.scores.dict() if analysis_data.scores else None,
            "features": analysis_data.features,
            "tips": analysis_data.tips,
            "grade": analysis_data.grade,
            "stroke": analysis_data.stroke,
            "stroke_confidence": analysis_data.stroke_confidence,
            "model_used": analysis_data.model_used,
            "error": analysis_data.error,
            "handedness": analysis_data.handedness,
            "analyzed_at": analysis_data.analyzed_at or datetime.utcnow(),
            "created_at": datetime.utcnow()
        }

        # Insert into database
        result = analysis_collection.insert_one(analysis_doc)
        analysis_doc["_id"] = result.inserted_id

        return analysis_to_response(analysis_doc)

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create analysis: {exc}")


@router.put("/{analysis_id}", response_model=AnalysisResponse)
async def update_analysis(analysis_id: str, update_data: AnalysisUpdate):
    """Update an existing analysis."""
    try:
        # Build update document
        update_doc = {"$set": {}}

        if update_data.status is not None:
            update_doc["$set"]["status"] = update_data.status
        if update_data.scores is not None:
            update_doc["$set"]["scores"] = update_data.scores.dict()
        if update_data.features is not None:
            update_doc["$set"]["features"] = update_data.features
        if update_data.tips is not None:
            update_doc["$set"]["tips"] = update_data.tips
        if update_data.grade is not None:
            update_doc["$set"]["grade"] = update_data.grade
        if update_data.stroke is not None:
            update_doc["$set"]["stroke"] = update_data.stroke
        if update_data.stroke_confidence is not None:
            update_doc["$set"]["stroke_confidence"] = update_data.stroke_confidence
        if update_data.model_used is not None:
            update_doc["$set"]["model_used"] = update_data.model_used
        if update_data.error is not None:
            update_doc["$set"]["error"] = update_data.error

        # Set analyzed_at if status is completed
        if update_data.status == "completed":
            update_doc["$set"]["analyzed_at"] = datetime.utcnow()

        if not update_doc["$set"]:
            raise HTTPException(status_code=400, detail="No fields to update")

        # Update in database
        result = analysis_collection.update_one(
            {"_id": ObjectId(analysis_id)},
            update_doc
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")

        # Get updated document
        updated_analysis = analysis_collection.find_one({"_id": ObjectId(analysis_id)})
        return analysis_to_response(updated_analysis)

    except Exception as exc:
        if "404" in str(exc) or "400" in str(exc):
            raise exc
        raise HTTPException(status_code=500, detail=f"Failed to update analysis: {exc}")


@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete an analysis record."""
    try:
        result = analysis_collection.delete_one({"_id": ObjectId(analysis_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")

        return {"message": "Analysis deleted successfully"}

    except Exception as exc:
        if "404" in str(exc):
            raise exc
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {exc}")


@router.get("/stats/summary")
async def get_analysis_stats():
    """Get analysis statistics for admin dashboard."""
    try:
        # Get counts by status
        total = analysis_collection.count_documents({})
        completed = analysis_collection.count_documents({"status": "completed"})
        processing = analysis_collection.count_documents({"status": "processing"})
        failed = analysis_collection.count_documents({"status": "failed"})
        pending = analysis_collection.count_documents({"status": "pending"})

        # Get average score for completed analyses
        completed_analyses = list(analysis_collection.find(
            {"status": "completed", "scores.overall": {"$exists": True}},
            {"scores.overall": 1}
        ))
        avg_score = None
        if completed_analyses:
            total_score = sum(analysis["scores"]["overall"] for analysis in completed_analyses)
            avg_score = round(total_score / len(completed_analyses), 1)

        # Get stroke distribution
        stroke_pipeline = [
            {"$match": {"status": "completed", "stroke": {"$ne": None}}},
            {"$group": {"_id": "$stroke", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        stroke_stats = list(analysis_collection.aggregate(stroke_pipeline))

        # Get grade distribution
        grade_pipeline = [
            {"$match": {"status": "completed", "grade": {"$ne": None}}},
            {"$group": {"_id": "$grade", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        grade_stats = list(analysis_collection.aggregate(grade_pipeline))

        return {
            "total": total,
            "completed": completed,
            "processing": processing,
            "failed": failed,
            "pending": pending,
            "average_score": avg_score,
            "stroke_distribution": stroke_stats,
            "grade_distribution": grade_stats
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to get analysis stats: {exc}")