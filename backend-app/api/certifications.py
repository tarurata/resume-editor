"""
Certifications Management API endpoints
CRUD operations for certifications
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from database.database import DatabaseService
from database.models import Certification
from pydantic import BaseModel

router = APIRouter()

# Dependency to get database service
def get_database_service():
    return DatabaseService()

# Request/Response models
class CertificationCreate(BaseModel):
    """Model for creating certification entry"""
    user_id: str
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

@router.post("/", response_model=Certification, status_code=201)
async def create_certification(
    certification_data: CertificationCreate,
    db: DatabaseService = Depends(get_database_service)
):
    """Create a new certification entry"""
    try:
        certification = Certification(**certification_data.dict())
        result = db.create_certification(certification)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/{user_id}", response_model=List[Certification])
async def get_certifications_list(
    user_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get all certifications for a user"""
    try:
        certifications_list = db.get_certifications(user_id)
        return certifications_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{certification_id}", response_model=Certification)
async def get_certification(
    certification_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get a specific certification by ID"""
    try:
        certification = db.get_certification_by_id(certification_id)
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

@router.put("/{certification_id}", response_model=Certification)
async def update_certification(
    certification_id: str,
    certification_data: CertificationUpdate,
    db: DatabaseService = Depends(get_database_service)
):
    """Update a certification entry"""
    try:
        # Get existing certification entry
        existing = db.get_certification_by_id(certification_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail=f"Certification with ID {certification_id} not found"
            )
        
        # Update only provided fields
        update_data = certification_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing, field, value)
        
        result = db.update_certification(existing)
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
    db: DatabaseService = Depends(get_database_service)
):
    """Delete a certification entry"""
    try:
        success = db.delete_certification(certification_id)
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
