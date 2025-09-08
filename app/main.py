from fastapi import FastAPI
from app.api.health import router as health_router
from app.core.config import settings

app = FastAPI(
    title="Resume Editor API",
    description="FastAPI service for resume editor backend",
    version="1.0.0"
)

# Include routers
app.include_router(health_router, prefix="/api/v1", tags=["health"])

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
