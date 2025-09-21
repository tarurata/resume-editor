"""
Resume Versions API endpoints
Multi-company resume management
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from database.database import DatabaseService
from database.models import ResumeVersion, ResumeVersionCreate, ResumeVersionUpdate
from pydantic import BaseModel, ValidationError
import json

router = APIRouter()

# Dependency to get database service
def get_database_service():
    return DatabaseService()

def validate_resume_data(resume_data: str) -> Dict[str, Any]:
    """Validate resume data JSON structure"""
    try:
        data = json.loads(resume_data)
        
        # Check required fields
        if not isinstance(data, dict):
            raise ValueError("Resume data must be a JSON object")
        
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
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in resume data: {str(e)}")
    except Exception as e:
        raise ValueError(f"Resume data validation failed: {str(e)}")

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
        # Validate resume data structure
        validated_data = validate_resume_data(resume_version_data.resume_data)
        
        # Update the resume data with validated/cleaned data
        resume_version_data.resume_data = json.dumps(validated_data)
        
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
        # Validate resume data if it's being updated
        if hasattr(update_data, 'resume_data') and update_data.resume_data:
            validated_data = validate_resume_data(update_data.resume_data)
            update_data.resume_data = json.dumps(validated_data)
        
        result = db.update_resume_version(version_id, update_data)
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
