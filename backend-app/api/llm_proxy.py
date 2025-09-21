from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import aiohttp
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class LLMRequest(BaseModel):
    prompt: str
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000
    model: Optional[str] = None

class LLMResponse(BaseModel):
    text: str
    usage: Optional[Dict[str, Any]] = None
    model: Optional[str] = None
    finish_reason: Optional[str] = None

@router.post("/generate", response_model=LLMResponse)
async def generate_text(request: LLMRequest):
    """Proxy LLM requests to the existing frontend LLM service"""
    try:
        # For now, we'll use a direct OpenAI approach
        # In the future, this could proxy to the frontend LLM service
        import openai
        from openai import AsyncOpenAI
        from ..core.config import get_settings
        
        settings = get_settings()
        
        if not settings.llm_api_key:
            # Return mock response
            return LLMResponse(
                text="Mock LLM response for development",
                model="mock",
                finish_reason="stop"
            )
        
        client = AsyncOpenAI(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url
        )
        
        response = await client.chat.completions.create(
            model=request.model or settings.llm_model,
            messages=[{"role": "user", "content": request.prompt}],
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        return LLMResponse(
            text=response.choices[0].message.content,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            },
            model=response.model,
            finish_reason=response.choices[0].finish_reason
        )
        
    except Exception as e:
        logger.error(f"LLM proxy request failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Check LLM service health"""
    try:
        from ..core.config import get_settings
        settings = get_settings()
        
        return {
            "provider": "openai",
            "can_use_real_ai": bool(settings.llm_api_key),
            "model": settings.llm_model,
            "base_url": settings.llm_base_url
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "provider": "error",
            "can_use_real_ai": False,
            "error": str(e)
        }
