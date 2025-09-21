from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
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
        import httpx
        from ..core.config import get_settings
        
        settings = get_settings()
        
        if not settings.llm_api_key:
            # Return mock response
            return LLMResponse(
                text="Mock LLM response for development",
                model="mock",
                finish_reason="stop"
            )
        
        # Use httpx directly to avoid OpenAI client issues
        headers = {
            "Authorization": f"Bearer {settings.llm_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": request.model or settings.llm_model,
            "messages": [{"role": "user", "content": request.prompt}],
            "max_tokens": request.max_tokens,
            "temperature": request.temperature
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.llm_base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
        
        # Extract JSON from markdown-wrapped responses if needed
        content = data["choices"][0]["message"]["content"]
        
        # Check if response is wrapped in markdown code blocks
        if content.strip().startswith("```json") and content.strip().endswith("```"):
            # Extract JSON from markdown code blocks
            lines = content.strip().split('\n')
            json_lines = []
            in_json = False
            for line in lines:
                if line.strip().startswith("```json"):
                    in_json = True
                    continue
                elif line.strip().startswith("```") and in_json:
                    break
                elif in_json:
                    json_lines.append(line)
            content = '\n'.join(json_lines)
        elif content.strip().startswith("```") and content.strip().endswith("```"):
            # Extract content from generic code blocks
            lines = content.strip().split('\n')
            content_lines = []
            in_code = False
            for line in lines:
                if line.strip().startswith("```"):
                    if in_code:
                        break
                    in_code = True
                    continue
                elif in_code:
                    content_lines.append(line)
            content = '\n'.join(content_lines)
        
        return LLMResponse(
            text=content,
            usage={
                "prompt_tokens": data["usage"]["prompt_tokens"],
                "completion_tokens": data["usage"]["completion_tokens"],
                "total_tokens": data["usage"]["total_tokens"]
            },
            model=data["model"],
            finish_reason=data["choices"][0]["finish_reason"]
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
