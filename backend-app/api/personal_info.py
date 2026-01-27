"""
Personal Information API endpoints
CRUD operations for personal information
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.database.database import get_db, DatabaseService
from app.database.models import PersonalInfo
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Request/Response models
class PersonalInfoCreate(BaseModel):
    """Model for creating personal information"""
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

class PersonalInfoResponse(BaseModel):
    """Response model for personal information"""
    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    class Config:
        orm_mode = True

@router.post("/", response_model=PersonalInfoResponse, status_code=201)
async def create_personal_info(
    personal_info_data: PersonalInfoCreate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create personal information for a user"""
    try:
        # Check if personal info already exists for user
        existing = db.get_personal_info(current_user.id)
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Personal information already exists for user {current_user.id}"
            )
        
        # Create new personal info
        personal_info = PersonalInfo(
            user_id=current_user.id,
            **personal_info_data.dict()
        )
        result = db.create_personal_info(personal_info)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=PersonalInfoResponse)
async def get_personal_info(
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get personal information by user ID"""
    personal_info = db.get_personal_info(current_user.id)
    if not personal_info:
        raise HTTPException(
            status_code=404,
            detail=f"Personal information not found for user {current_user.id}"
        )
    return personal_info

@router.put("/", response_model=PersonalInfoResponse)
async def update_personal_info(
    personal_info_data: PersonalInfoUpdate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update personal information for a user"""
    try:
        update_data = personal_info_data.dict(exclude_unset=True)
        result = db.update_personal_info(current_user.id, update_data)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Personal information not found for user {current_user.id}"
            )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/", status_code=204)
async def delete_personal_info(
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete personal information for a user"""
    try:
        success = db.delete_personal_info(current_user.id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Personal information not found for user {current_user.id}"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
