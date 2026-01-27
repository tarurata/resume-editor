"""
Education Management API endpoints
CRUD operations for education entries
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.database.database import get_db, DatabaseService
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Request/Response models
class EducationCreate(BaseModel):
    """Model for creating education entry"""
    degree: str
    institution: str
    field_of_study: str
    graduation_date: str
    gpa: Optional[float] = None
    location: Optional[str] = None

class EducationUpdate(BaseModel):
    """Model for updating education entry"""
    degree: Optional[str] = None
    institution: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_date: Optional[str] = None
    gpa: Optional[float] = None
    location: Optional[str] = None

class EducationResponse(BaseModel):
    """Response model for education"""
    id: str
    user_id: str
    degree: str
    institution: str
    field_of_study: str
    graduation_date: str
    gpa: Optional[float] = None
    location: Optional[str] = None

    class Config:
        orm_mode = True

@router.post("/", response_model=EducationResponse, status_code=201)
async def create_education(
    education_data: EducationCreate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new education entry"""
    try:
        result = db.create_education(user_id=current_user.id, education_data=education_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[EducationResponse])
async def get_education_list(
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all education entries for a user"""
    try:
        education_list = db.get_education(current_user.id)
        return education_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{education_id}", response_model=EducationResponse)
async def get_education(
    education_id: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific education entry by ID"""
    try:
        education = db.get_education_by_id(education_id, current_user.id)
        if not education:
            raise HTTPException(
                status_code=404,
                detail=f"Education entry with ID {education_id} not found"
            )
        return education
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: str,
    education_data: EducationUpdate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an education entry"""
    try:
        result = db.update_education(education_id, current_user.id, education_data)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Education entry with ID {education_id} not found"
            )
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{education_id}", status_code=204)
async def delete_education(
    education_id: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an education entry"""
    try:
        success = db.delete_education(education_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Education entry with ID {education_id} not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
