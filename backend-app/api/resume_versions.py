"""
Resume Versions API endpoints
Multi-company resume management
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from app.database.database import get_db, DatabaseService
from app.models.user import User
from app.core.security import get_current_user

from app.models.resume import Resume, ResumeVersion, ResumeVersionCreate, ResumeVersionUpdate
from pydantic import BaseModel, ValidationError
import json

router = APIRouter()

def validate_resume_data(resume_data: Resume) -> Dict[str, Any]:
    """Validate resume data from a Resume model"""
    if not isinstance(resume_data, Resume):
        raise TypeError(f"Expected a Resume model, but got {type(resume_data).__name__}")

    try:
        data = resume_data.model_dump()
        
        # Validate experience data structure
        if 'experience' in data and isinstance(data['experience'], list):
            for i, exp in enumerate(data['experience']):
                if not isinstance(exp, dict):
                    raise ValueError(f"Experience entry {i} must be an object")
                
                # Check required fields
                if 'role' not in exp or not isinstance(exp['role'], str):
                    raise ValueError(f"Experience entry {i} must have a 'role' field (string)")
                if 'organization' not in exp or not isinstance(exp['organization'], str):
                    raise ValueError(f"Experience entry {i} must have an 'organization' field (string)")
                if 'startDate' not in exp or not isinstance(exp['startDate'], str):
                    raise ValueError(f"Experience entry {i} must have a 'startDate' field (string)")
                
                # Check achievements field (should be array of strings)
                if 'achievements' in exp:
                    if not isinstance(exp['achievements'], list):
                        raise ValueError(f"Experience entry {i} 'achievements' must be an array")
                    for j, achievement in enumerate(exp['achievements']):
                        if not isinstance(achievement, str):
                            raise ValueError(f"Experience entry {i} achievement {j} must be a string")
                elif 'bullets' in exp:
                    # Legacy support: convert bullets to achievements
                    if isinstance(exp['bullets'], list):
                        exp['achievements'] = exp['bullets']
                        del exp['bullets']
                    else:
                        raise ValueError(f"Experience entry {i} 'bullets' must be an array")
        
        return data
    except Exception as e:
        # Re-raise with a more specific message if it's a validation issue.
        if isinstance(e, (ValidationError, TypeError)):
             raise e
        raise ValueError(f"Resume data validation failed during processing: {str(e)}")

# Request/Response models
class ResumeVersionResponse(ResumeVersion):
    """Response model for resume version"""
    pass

class SetActiveVersionRequest(BaseModel):
    """Request model for setting active version"""
    version_id: int

@router.post("/", response_model=ResumeVersion, status_code=201)
async def create_resume_version(
    resume_version_data: ResumeVersionCreate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new resume version for a specific company"""
    try:
        # Validate resume data structure
        validated_data = validate_resume_data(resume_version_data.resume_data)
        
        # Update the resume data with validated/cleaned data (keep as dict)
        resume_version_data.resume_data = validated_data
        
        result = db.create_resume_version(resume_version_data, current_user.id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[ResumeVersion])
async def get_resume_versions(
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all resume versions for a user"""
    try:
        versions = db.get_resume_versions(current_user.id)
        return versions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/{user_id}", response_model=List[ResumeVersion])
async def get_resume_versions_for_user(
    user_id: str,
    db: DatabaseService = Depends(get_db)
):
    """Get all resume versions for a specific user ID (for M1 demo)"""
    try:
        versions = db.get_resume_versions(user_id)
        return versions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/{user_id}/{version_id}", response_model=ResumeVersion)
async def get_resume_version_for_user(
    user_id: str,
    version_id: str,
    db: DatabaseService = Depends(get_db)
):
    """Get a specific resume version by ID for a specific user ID (for M1 demo)"""
    try:
        version = db.get_resume_version(version_id, user_id)
        if not version:
            raise HTTPException(
                status_code=404,
                detail=f"Resume version with ID {version_id} not found for user {user_id}"
            )
        return version
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{version_id}", response_model=ResumeVersion)
async def get_resume_version(
    version_id: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific resume version by ID"""
    try:
        version = db.get_resume_version(version_id, current_user.id)
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

@router.put("/user/{user_id}/{version_id}", response_model=ResumeVersion)
async def update_resume_version_for_user(
    user_id: str,
    version_id: str,
    update_data: ResumeVersionUpdate,
    db: DatabaseService = Depends(get_db)
):
    """Update a resume version for a specific user ID (for M1 demo)"""
    try:
        # Validate resume data if it's being updated
        if hasattr(update_data, 'resume_data') and update_data.resume_data:
            validated_data = validate_resume_data(update_data.resume_data)
            # Convert back to dict for storage (database expects dict)
            update_data.resume_data = validated_data
        
        result = db.update_resume_version(version_id, update_data, user_id)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Resume version with ID {version_id} not found for user {user_id}"
            )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
        
@router.put("/{version_id}", response_model=ResumeVersion)
async def update_resume_version(
    version_id: str,
    update_data: ResumeVersionUpdate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a resume version"""
    try:
        # Validate resume data if it's being updated
        if hasattr(update_data, 'resume_data') and update_data.resume_data:
            validated_data = validate_resume_data(update_data.resume_data)
            # Convert back to dict for storage (database expects dict)
            update_data.resume_data = validated_data
        
        result = db.update_resume_version(version_id, update_data, current_user.id)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Resume version with ID {version_id} not found"
            )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{version_id}", status_code=204)
async def delete_resume_version(
    version_id: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a resume version"""
    try:
        success = db.delete_resume_version(version_id, current_user.id)
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
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set a resume version as active (deactivate others for the user)"""
    try:
        success = db.set_active_resume_version(version_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Resume version with ID {version_id} not found for user {current_user.id}"
            )
        return {"message": f"Resume version {version_id} set as active", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/active", response_model=ResumeVersion)
async def get_active_resume_version(
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the currently active resume version for a user"""
    try:
        active_version = db.get_active_resume_version(current_user.id)
        if not active_version:
            raise HTTPException(
                status_code=404,
                detail=f"No active resume version found for user {current_user.id}"
            )
        return active_version
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/{version_id}/copy-experiences", response_model=dict)
async def copy_experiences_to_version(
    version_id: str,
    source_version_id: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Copy experiences from one resume version to another"""
    try:
        # Verify both resume versions exist and belong to the user
        source_version = db.get_resume_version(source_version_id, current_user.id)
        if not source_version:
            raise HTTPException(
                status_code=404,
                detail=f"Source resume version with ID {source_version_id} not found"
            )
        
        target_version = db.get_resume_version(version_id, current_user.id)
        if not target_version:
            raise HTTPException(
                status_code=404,
                detail=f"Target resume version with ID {version_id} not found"
            )
        
        # Copy experiences
        copied_experiences = db.copy_experiences(source_version_id, version_id)
        
        return {
            "message": f"Successfully copied {len(copied_experiences)} experiences",
            "copied_count": len(copied_experiences),
            "success": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
