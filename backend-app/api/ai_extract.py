from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
from ..services.ai_service import AIService
from ..database.database import get_db
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

class JDExtractRequest(BaseModel):
    job_description: str
    user_id: Optional[str] = None

class JDExtractResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    errors: Optional[List[str]] = None

class ResumeRewriteRequest(BaseModel):
    resume_data: Dict[str, Any]  # Complete resume data structure
    job_description: str
    word_limit: Optional[int] = None
    target_sections: List[str]  # Sections to rewrite: ['title', 'summary', 'experience', 'education', 'certifications', 'skills']
    current_section_id: Optional[str] = None
    user_id: Optional[str] = None

class ResumeRewriteResponse(BaseModel):
    success: bool
    rewritten_sections: Optional[Dict[str, Dict[str, Any]]] = None
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

@router.post("/extract-jd", response_model=JDExtractResponse)
async def extract_job_description(
    request: JDExtractRequest,
    db: Session = Depends(get_db)
):
    """
    Extract key information from job description using AI
    """
    try:
        ai_service = AIService()
        result = await ai_service.extract_job_description(request.job_description)
        
        # Log extraction attempt
        logger.info(f"JD extraction completed for user {request.user_id}")
        
        return JDExtractResponse(
            success=True,
            data=result.get("data"),
            confidence=result.get("confidence", 0.0),
            errors=result.get("errors", [])
        )
        
    except Exception as e:
        logger.error(f"JD extraction failed: {str(e)}")
        return JDExtractResponse(
            success=False,
            data=None,
            confidence=0.0,
            errors=[f"JD extraction failed: {str(e)}"]
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

@router.get("/test-openai")
async def test_openai_direct():
    """
    Test OpenAI API directly with aiohttp
    """
    try:
        import aiohttp
        import os
        from ..core.config import get_settings
        
        settings = get_settings()
        
        if not settings.llm_api_key:
            return {"success": False, "error": "No API key found"}
        
        headers = {
            "Authorization": f"Bearer {settings.llm_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": settings.llm_model,
            "messages": [{"role": "user", "content": "Say 'Hello from OpenAI'"}],
            "max_tokens": 10
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{settings.llm_base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return {
                        "success": True,
                        "response": result["choices"][0]["message"]["content"],
                        "model": settings.llm_model
                    }
                else:
                    error_text = await response.text()
                    return {
                        "success": False,
                        "error": f"OpenAI API error {response.status}: {error_text}"
                    }
        
    except Exception as e:
        logger.error(f"Direct OpenAI test failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/rewrite-resume", response_model=ResumeRewriteResponse)
async def rewrite_resume_with_jd_tone(
    request: ResumeRewriteRequest,
    db: Session = Depends(get_db)
):
    """
    Rewrite specific sections of a resume to match the tone and language of a job description
    """
    try:
        ai_service = AIService()
        
        # Validate target sections
        valid_sections = ['title', 'summary', 'experience', 'education', 'certifications', 'skills']
        invalid_sections = [s for s in request.target_sections if s not in valid_sections]
        if invalid_sections:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid target sections: {invalid_sections}. Valid sections are: {valid_sections}"
            )
        
        # Validate job description
        if not request.job_description or len(request.job_description.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Job description must be at least 50 characters long"
            )
        
        # Call AI service to rewrite resume sections
        result = await ai_service.rewrite_resume_with_jd_tone(
            resume_data=request.resume_data,
            job_description=request.job_description,
            target_sections=request.target_sections,
            word_limit=request.word_limit
        )
        
        # Log rewrite attempt
        logger.info(f"Resume rewrite completed for user {request.user_id}, sections: {request.target_sections}")
        
        return ResumeRewriteResponse(
            success=True,
            rewritten_sections=result.get("rewritten_sections"),
            suggestions=result.get("suggestions", []),
            confidence=result.get("confidence", 0.0),
            errors=result.get("errors", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume rewrite failed: {str(e)}")
        return ResumeRewriteResponse(
            success=False,
            rewritten_sections=None,
            suggestions=None,
            confidence=0.0,
            errors=[f"Resume rewrite failed: {str(e)}"]
        )
