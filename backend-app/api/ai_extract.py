from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
from ..services.ai_service import AIService
from ..core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/ai", tags=["AI"])

logger = logging.getLogger(__name__)

class ExtractRequest(BaseModel):
    text: str
    extraction_type: str = "comprehensive"  # personal_info, sections, structured, comprehensive
    user_id: Optional[str] = None

class ExtractResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    errors: Optional[List[str]] = None
    extraction_type: str

class ImproveRequest(BaseModel):
    content: str
    improvement_type: str = "general"  # general, summary, experience, skills
    context: Optional[str] = None
    user_id: Optional[str] = None

class ImproveResponse(BaseModel):
    success: bool
    improved_content: Optional[str] = None
    suggestions: Optional[List[str]] = None
    confidence: Optional[float] = None
    errors: Optional[List[str]] = None

@router.post("/extract", response_model=ExtractResponse)
async def extract_resume_data(
    request: ExtractRequest,
    db: Session = Depends(get_db)
):
    """
    Extract structured data from resume text using AI
    """
    try:
        ai_service = AIService()
        
        if request.extraction_type == "personal_info":
            result = await ai_service.extract_personal_info(request.text)
        elif request.extraction_type == "sections":
            result = await ai_service.extract_resume_sections(request.text)
        elif request.extraction_type == "structured":
            result = await ai_service.extract_structured_resume(request.text)
        elif request.extraction_type == "comprehensive":
            result = await ai_service.extract_comprehensive_resume(request.text)
        else:
            raise HTTPException(status_code=400, detail="Invalid extraction_type")
        
        # Log extraction attempt
        logger.info(f"AI extraction completed for user {request.user_id}, type: {request.extraction_type}")
        
        return ExtractResponse(
            success=True,
            data=result.get("data"),
            confidence=result.get("confidence", 0.0),
            errors=result.get("errors", []),
            extraction_type=request.extraction_type
        )
        
    except Exception as e:
        logger.error(f"AI extraction failed: {str(e)}")
        return ExtractResponse(
            success=False,
            data=None,
            confidence=0.0,
            errors=[f"Extraction failed: {str(e)}"],
            extraction_type=request.extraction_type
        )

@router.post("/improve", response_model=ImproveResponse)
async def improve_resume_content(
    request: ImproveRequest,
    db: Session = Depends(get_db)
):
    """
    Improve resume content using AI suggestions
    """
    try:
        ai_service = AIService()
        
        result = await ai_service.improve_content(
            content=request.content,
            improvement_type=request.improvement_type,
            context=request.context
        )
        
        # Log improvement attempt
        logger.info(f"AI improvement completed for user {request.user_id}, type: {request.improvement_type}")
        
        return ImproveResponse(
            success=True,
            improved_content=result.get("improved_content"),
            suggestions=result.get("suggestions", []),
            confidence=result.get("confidence", 0.0),
            errors=result.get("errors", [])
        )
        
    except Exception as e:
        logger.error(f"AI improvement failed: {str(e)}")
        return ImproveResponse(
            success=False,
            improved_content=None,
            suggestions=None,
            confidence=0.0,
            errors=[f"Improvement failed: {str(e)}"]
        )

@router.get("/health")
async def ai_health_check():
    """
    Check AI service health and configuration
    """
    try:
        ai_service = AIService()
        health_info = await ai_service.get_health_status()
        
        return {
            "status": "healthy",
            "provider": health_info.get("provider"),
            "can_use_real_ai": health_info.get("can_use_real_ai", False),
            "rate_limit_status": health_info.get("rate_limit_status", {})
        }
        
    except Exception as e:
        logger.error(f"AI health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }
