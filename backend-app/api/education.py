"""
Education Management API endpoints
CRUD operations for education entries
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from database.database import DatabaseService
from database.models import Education
from pydantic import BaseModel

router = APIRouter()

# Dependency to get database service
def get_database_service():
    return DatabaseService()

# Request/Response models
class EducationCreate(BaseModel):
    """Model for creating education entry"""
    user_id: str
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

@router.post("/", response_model=Education, status_code=201)
async def create_education(
    education_data: EducationCreate,
    db: DatabaseService = Depends(get_database_service)
):
    """Create a new education entry"""
    try:
        education = Education(**education_data.dict())
        result = db.create_education(education)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/{user_id}", response_model=List[Education])
async def get_education_list(
    user_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get all education entries for a user"""
    try:
        education_list = db.get_education(user_id)
        return education_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{education_id}", response_model=Education)
async def get_education(
    education_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get a specific education entry by ID"""
    try:
        education = db.get_education_by_id(education_id)
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

@router.put("/{education_id}", response_model=Education)
async def update_education(
    education_id: str,
    education_data: EducationUpdate,
    db: DatabaseService = Depends(get_database_service)
):
    """Update an education entry"""
    try:
        # Get existing education entry
        existing = db.get_education_by_id(education_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail=f"Education entry with ID {education_id} not found"
            )
        
        # Update only provided fields
        update_data = education_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing, field, value)
        
        result = db.update_education(existing)
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
    db: DatabaseService = Depends(get_database_service)
):
    """Delete an education entry"""
    try:
        success = db.delete_education(education_id)
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
