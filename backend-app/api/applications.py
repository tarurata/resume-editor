"""
Applications Tracking API endpoints
Job application management
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from database.database import DatabaseService
from database.models import Application, ApplicationCreate, ApplicationUpdate
from pydantic import BaseModel

router = APIRouter()

# Dependency to get database service
def get_database_service():
    return DatabaseService()

# Request/Response models
class ApplicationResponse(Application):
    """Response model for application"""
    pass

class ApplicationStatusUpdate(BaseModel):
    """Model for updating application status"""
    status: str
    notes: Optional[str] = None

@router.post("/", response_model=Application, status_code=201)
async def create_application(
    application_data: ApplicationCreate,
    db: DatabaseService = Depends(get_database_service)
):
    """Create a new job application"""
    try:
        result = db.create_application(application_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/{user_id}", response_model=List[Application])
async def get_applications(
    user_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get all applications for a user"""
    try:
        applications = db.get_applications(user_id)
        return applications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{application_id}", response_model=Application)
async def get_application(
    application_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get a specific application by ID"""
    try:
        application = db.get_application(application_id)
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

@router.put("/{application_id}", response_model=Application)
async def update_application(
    application_id: str,
    update_data: ApplicationUpdate,
    db: DatabaseService = Depends(get_database_service)
):
    """Update an application"""
    try:
        result = db.update_application(application_id, update_data)
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

@router.patch("/{application_id}/status", response_model=Application)
async def update_application_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    db: DatabaseService = Depends(get_database_service)
):
    """Update application status and notes"""
    try:
        update_data = ApplicationUpdate(
            status=status_update.status,
            notes=status_update.notes
        )
        result = db.update_application(application_id, update_data)
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
    application_id: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Delete an application"""
    try:
        success = db.delete_application(application_id)
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

@router.get("/user/{user_id}/status/{status}", response_model=List[Application])
async def get_applications_by_status(
    user_id: str,
    status: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get applications filtered by status"""
    try:
        applications = db.get_applications(user_id)
        filtered_applications = [app for app in applications if app.status == status]
        return filtered_applications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user/{user_id}/company/{company}", response_model=List[Application])
async def get_applications_by_company(
    user_id: str,
    company: str,
    db: DatabaseService = Depends(get_database_service)
):
    """Get applications filtered by company"""
    try:
        applications = db.get_applications(user_id)
        filtered_applications = [app for app in applications if app.company.lower() == company.lower()]
        return filtered_applications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
