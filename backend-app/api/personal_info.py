"""
Personal Information API endpoints
CRUD operations for personal information
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from database.database import DatabaseService
from database.models import PersonalInfo
from pydantic import BaseModel

router = APIRouter()

# Dependency to get database service
def get_database_service():
    return DatabaseService()

# Request/Response models
class PersonalInfoCreate(BaseModel):
    """Model for creating personal information"""
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class PersonalInfoUpdate(BaseModel):
    """Model for updating personal information"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

@router.post("/", response_model=PersonalInfo, status_code=201)
async def create_personal_info(
    personal_info_data: PersonalInfoCreate,
    db: DatabaseService = Depends(get_database_service)
):
    """Create personal information for a user"""
    try:
        # Check if personal info already exists for user
        existing = db.get_personal_info(personal_info_data.user_id)
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Personal information already exists for user {personal_info_data.user_id}"
            )
        
        # Create new personal info
        personal_info = PersonalInfo(**personal_info_data.dict())
        result = db.create_personal_info(personal_info)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{user_id}", response_model=PersonalInfo)
async def get_personal_info(
    user_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get personal information by user ID"""
    personal_info = db.get_personal_info(user_id)
    if not personal_info:
        raise HTTPException(
            status_code=404,
            detail=f"Personal information not found for user {user_id}"
        )
    return personal_info

@router.put("/{user_id}", response_model=PersonalInfo)
async def update_personal_info(
    user_id: str,
    personal_info_data: PersonalInfoUpdate,
    db: DatabaseService = Depends(get_database_service)
):
    """Update personal information for a user"""
    try:
        # Get existing personal info
        existing = db.get_personal_info(user_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail=f"Personal information not found for user {user_id}"
            )
        
        # Update only provided fields
        update_data = personal_info_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing, field, value)
        
        result = db.update_personal_info(existing)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{user_id}", status_code=204)
async def delete_personal_info(
    user_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Delete personal information for a user"""
    try:
        success = db.delete_personal_info(user_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Personal information not found for user {user_id}"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
