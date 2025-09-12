"""
Resume Versions API endpoints
Multi-company resume management
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from database.database import DatabaseService
from database.models import ResumeVersion, ResumeVersionCreate, ResumeVersionUpdate
from pydantic import BaseModel

router = APIRouter()

# Dependency to get database service
def get_database_service():
    return DatabaseService()

# Request/Response models
class ResumeVersionResponse(ResumeVersion):
    """Response model for resume version"""
    pass

class SetActiveVersionRequest(BaseModel):
    """Request model for setting active version"""
    version_id: str

@router.post("/", response_model=ResumeVersion, status_code=201)
async def create_resume_version(
    user_id: str,
    resume_version_data: ResumeVersionCreate,
    db: DatabaseService = Depends(get_database_service)
):
    """Create a new resume version for a specific company"""
    try:
        result = db.create_resume_version(resume_version_data, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/{user_id}", response_model=List[ResumeVersion])
async def get_resume_versions(
    user_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get all resume versions for a user"""
    try:
        versions = db.get_resume_versions(user_id)
        return versions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{version_id}", response_model=ResumeVersion)
async def get_resume_version(
    version_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get a specific resume version by ID"""
    try:
        version = db.get_resume_version(version_id)
        if not version:
            raise HTTPException(
                status_code=404,
                detail=f"Resume version with ID {version_id} not found"
            )
        return version
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{version_id}", response_model=ResumeVersion)
async def update_resume_version(
    version_id: str,
    update_data: ResumeVersionUpdate,
    db: DatabaseService = Depends(get_database_service)
):
    """Update a resume version"""
    try:
        result = db.update_resume_version(version_id, update_data)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Resume version with ID {version_id} not found"
            )
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{version_id}", status_code=204)
async def delete_resume_version(
    version_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Delete a resume version"""
    try:
        success = db.delete_resume_version(version_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Resume version with ID {version_id} not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/{version_id}/activate", response_model=dict)
async def set_active_resume_version(
    version_id: str,
    user_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Set a resume version as active (deactivate others for the user)"""
    try:
        success = db.set_active_resume_version(version_id, user_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Resume version with ID {version_id} not found for user {user_id}"
            )
        return {"message": f"Resume version {version_id} set as active", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/{user_id}/active", response_model=ResumeVersion)
async def get_active_resume_version(
    user_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get the currently active resume version for a user"""
    try:
        versions = db.get_resume_versions(user_id)
        active_version = next((v for v in versions if v.is_active), None)
        if not active_version:
            raise HTTPException(
                status_code=404,
                detail=f"No active resume version found for user {user_id}"
            )
        return active_version
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
