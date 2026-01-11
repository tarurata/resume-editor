"""
Applications Tracking API endpoints
Job application management
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.database.database import get_db, DatabaseService
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Request/Response models
class ApplicationResponse(BaseModel):
    """Response model for application"""
    id: int
    user_id: int
    resume_id: int
    job_title: str
    company: str
    application_date: str
    status: str
    notes: Optional[str] = None

    class Config:
        orm_mode = True

class ApplicationCreate(BaseModel):
    """Model for creating an application"""
    resume_id: int
    job_title: str
    company: str
    status: str
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    """Model for updating an application"""
    job_title: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    """Model for updating application status"""
    status: str
    notes: Optional[str] = None

@router.post("/", response_model=ApplicationResponse, status_code=201)
async def create_application(
    application_data: ApplicationCreate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new job application"""
    try:
        result = db.create_application(user_id=current_user.id, application_data=application_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all applications for a user"""
    try:
        applications = db.get_applications(current_user.id)
        return applications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific application by ID"""
    try:
        application = db.get_application(application_id, current_user.id)
        if not application:
            raise HTTPException(
                status_code=404,
                detail=f"Application with ID {application_id} not found"
            )
        return application
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    update_data: ApplicationUpdate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an application"""
    try:
        result = db.update_application(application_id, current_user.id, update_data)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Application with ID {application_id} not found"
            )
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update application status and notes"""
    try:
        update_data = ApplicationUpdate(
            status=status_update.status,
            notes=status_update.notes
        )
        result = db.update_application(application_id, current_user.id, update_data)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Application with ID {application_id} not found"
            )
        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{application_id}", status_code=204)
async def delete_application(
    application_id: int,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an application"""
    try:
        success = db.delete_application(application_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Application with ID {application_id} not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/status/{status}", response_model=List[ApplicationResponse])
async def get_applications_by_status(
    status: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get applications filtered by status"""
    try:
        applications = db.get_applications(current_user.id)
        filtered_applications = [app for app in applications if app.status == status]
        return filtered_applications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/company/{company}", response_model=List[ApplicationResponse])
async def get_applications_by_company(
    company: str,
    db: DatabaseService = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get applications filtered by company"""
    try:
        applications = db.get_applications(current_user.id)
        filtered_applications = [app for app in applications if app.company.lower() == company.lower()]
        return filtered_applications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
