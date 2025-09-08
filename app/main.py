from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.api.health import router as health_router
from app.api.edit import router as edit_router
from app.api.export import router as export_router
from app.core.config import settings

app = FastAPI(
    title="Resume Editor API",
    description="FastAPI service for resume editor backend with edit and export capabilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Include routers with version prefix
app.include_router(health_router, prefix="/api/v1", tags=["health"])
app.include_router(edit_router, prefix="/api/v1", tags=["edit"])
app.include_router(export_router, prefix="/api/v1", tags=["export"])


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Resume Editor API",
        version="1.0.0",
        description="""
        ## Resume Editor API
        
        This API provides endpoints for editing and exporting resume data.
        
        ### Features
        - **Edit Operations**: Modify individual sections of resumes with validation and change tracking
        - **Export Options**: Generate resumes in PDF, HTML, and JSON formats
        - **Version Control**: Track changes and maintain edit history
        - **Validation**: Ensure data integrity with comprehensive validation rules
        
        ### Data Models
        - **Resume**: Complete resume structure with title, summary, experience, and skills
        - **ExperienceEntry**: Individual work experience with role, organization, dates, and achievements
        - **FactsInventory**: Validated data for guardrails and consistency checks
        
        ### Authentication
        Currently no authentication is required. This will be added in future versions.
        """,
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

@app.get("/")
async def root():
    return {"message": "Resume Editor API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
