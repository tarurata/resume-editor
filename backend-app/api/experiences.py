"""
Experience API endpoints
Handles CRUD operations for work experiences and achievements
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from database.database import DatabaseService
from database.models import (
    Experience, Achievement, ExperienceCreate, ExperienceUpdate,
    AchievementCreate, AchievementUpdate
)

router = APIRouter()

# Dependency to get database service
def get_database_service():
    return DatabaseService()

# Request models
class AchievementCreateRequest(BaseModel):
    """Request model for creating achievement (without experience_id)"""
    achievement_text: str
    order_index: int = 0


@router.post("/", response_model=Experience)
async def create_experience(
    experience: ExperienceCreate,
    db: DatabaseService = Depends(get_database_service)
):
    """Create a new experience entry"""
    try:
        return db.create_experience(experience)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/resume/{resume_version_id}", response_model=List[Experience])
async def get_experiences(
    resume_version_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get all experiences for a resume version"""
    try:
        return db.get_experiences(resume_version_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{experience_id}", response_model=Experience)
async def get_experience(
    experience_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get specific experience by ID"""
    try:
        experience = db.get_experience(experience_id)
        if not experience:
            raise HTTPException(status_code=404, detail="Experience not found")
        return experience
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{experience_id}", response_model=Experience)
async def update_experience(
    experience_id: str,
    update_data: ExperienceUpdate,
    db: DatabaseService = Depends(get_database_service)
):
    """Update experience entry"""
    try:
        experience = db.update_experience(experience_id, update_data)
        if not experience:
            raise HTTPException(status_code=404, detail="Experience not found")
        return experience
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{experience_id}")
async def delete_experience(
    experience_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Delete experience entry and all its achievements"""
    try:
        success = db.delete_experience(experience_id)
        if not success:
            raise HTTPException(status_code=404, detail="Experience not found")
        return {"message": "Experience deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/resume/{resume_version_id}/with-achievements")
async def get_experiences_with_achievements(
    resume_version_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get experiences with their achievements for a resume version"""
    try:
        return db.get_experiences_with_achievements(resume_version_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Achievement endpoints
@router.post("/{experience_id}/achievements", response_model=Achievement)
async def create_achievement(
    experience_id: str,
    achievement: AchievementCreateRequest,
    db: DatabaseService = Depends(get_database_service)
):
    """Create a new achievement for an experience"""
    try:
        # Create a new achievement with the experience_id from URL
        achievement_data = AchievementCreate(
            experience_id=experience_id,
            achievement_text=achievement.achievement_text,
            order_index=achievement.order_index
        )
        return db.create_achievement(achievement_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{experience_id}/achievements", response_model=List[Achievement])
async def get_achievements(
    experience_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get all achievements for an experience"""
    try:
        return db.get_achievements(experience_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/achievements/{achievement_id}", response_model=Achievement)
async def get_achievement(
    achievement_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get specific achievement by ID"""
    try:
        achievement = db.get_achievement(achievement_id)
        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")
        return achievement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/achievements/{achievement_id}", response_model=Achievement)
async def update_achievement(
    achievement_id: str,
    update_data: AchievementUpdate,
    db: DatabaseService = Depends(get_database_service)
):
    """Update achievement"""
    try:
        achievement = db.update_achievement(achievement_id, update_data)
        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")
        return achievement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/achievements/{achievement_id}")
async def delete_achievement(
    achievement_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Delete achievement"""
    try:
        success = db.delete_achievement(achievement_id)
        if not success:
            raise HTTPException(status_code=404, detail="Achievement not found")
        return {"message": "Achievement deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
