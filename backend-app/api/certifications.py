"""
Certifications Management API endpoints
CRUD operations for certifications
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.database.database import get_db, DatabaseService
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Request/Response models
class CertificationCreate(BaseModel):
    """Model for creating certification entry"""
    name: str
    issuer: str
    issue_date: str
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None

class CertificationUpdate(BaseModel):
    """Model for updating certification entry"""
    name: Optional[str] = None
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None

class CertificationResponse(BaseModel):
    """Response model for certification"""
    id: str
    user_id: str
    name: str
    issuer: str
    issue_date: str
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None

    class Config:
        orm_mode = True

@router.post("/", response_model=CertificationResponse, status_code=201)
async def create_certification(
    certification_data: CertificationCreate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new certification entry"""
    try:
        result = db.create_certification(user_id=current_user.id, certification_data=certification_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[CertificationResponse])
async def get_certifications_list(
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all certifications for a user"""
    try:
        certifications_list = db.get_certifications(current_user.id)
        return certifications_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{certification_id}", response_model=CertificationResponse)
async def get_certification(
    certification_id: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific certification by ID"""
    try:
        certification = db.get_certification_by_id(certification_id, current_user.id)
        if not certification:
            raise HTTPException(
                status_code=404,
                detail=f"Certification with ID {certification_id} not found"
            )
        return certification
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{certification_id}", response_model=CertificationResponse)
async def update_certification(
    certification_id: str,
    certification_data: CertificationUpdate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a certification entry"""
    try:
        result = db.update_certification(certification_id, current_user.id, certification_data)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Certification with ID {certification_id} not found"
            )
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{certification_id}", status_code=204)
async def delete_certification(
    certification_id: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a certification entry"""
    try:
        success = db.delete_certification(certification_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Certification with ID {certification_id} not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
