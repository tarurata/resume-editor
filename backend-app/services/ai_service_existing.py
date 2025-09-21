import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from ..core.config import get_settings

logger = logging.getLogger(__name__)

class AIServiceExisting:
    def __init__(self):
        self.settings = get_settings()
        # We'll use the existing frontend LLM service via HTTP calls
        self.frontend_llm_url = "http://localhost:3000/api/llm"  # If we create an API endpoint
        # Or we can import and use the existing LLM service directly
        self._initialize_llm_service()
    
    def _initialize_llm_service(self):
        """Initialize using existing LLM service"""
        try:
            # Import the existing LLM service from the frontend
            import sys
            import os
            sys.path.append(os.path.join(os.path.dirname(__file__), '../../src/lib/llm'))
            
            from aiService import getAIService
            self.llm_service = getAIService()
            logger.info("Existing LLM service initialized successfully")
        except Exception as e:
            logger.warning(f"Could not initialize existing LLM service: {e}")
            self.llm_service = None
    
    async def extract_personal_info(self, text: str) -> Dict[str, Any]:
        """Extract personal information from resume text using existing LLM service"""
        prompt = f"""Extract personal information from the following resume text. Return a JSON object with the following structure:
{{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username"
}}

Only include fields that are clearly present in the text. Use null for missing fields.

Resume text:
{text}

Extract personal information:"""

        try:
            if self.llm_service:
                response = await self.llm_service.generate(prompt, {
                    'temperature': 0.1,
                    'maxTokens': 500
                })
                extracted = json.loads(response.text)
                
                # Validate that we have at least name or email
                if not extracted.get("name") and not extracted.get("email"):
                    return {
                        "data": None,
                        "confidence": 0.0,
                        "errors": ["No personal information found"]
                    }
                
                return {
                    "data": extracted,
                    "confidence": 0.9,
                    "errors": []
                }
            else:
                return self._get_mock_personal_info()
                
        except Exception as e:
            logger.error(f"Personal info extraction failed: {e}")
            return {
                "data": None,
                "confidence": 0.0,
                "errors": [f"Extraction failed: {str(e)}"]
            }
    
    async def extract_resume_sections(self, text: str) -> Dict[str, Any]:
        """Extract and categorize resume sections using existing LLM service"""
        prompt = f"""Analyze the following resume text and extract structured sections. Return a JSON array where each object has:
{{
  "type": "title" | "summary" | "experience" | "skills" | "education" | "certifications",
  "content": "The actual text content of this section",
  "startIndex": 0,
  "endIndex": 50
}}

Rules:
- "title" should be the person's name or resume title (usually first line)
- "summary" should be professional summary, objective, or profile
- "experience" should be work experience entries (job titles, companies, dates, descriptions)
- "skills" should be technical skills, technologies, or competencies
- "education" should be degrees, schools, graduation dates
- "certifications" should be professional certifications or licenses

For each section, provide the exact text content and calculate startIndex/endIndex based on position in the original text.

Resume text:
{text}

Extract sections:"""

        try:
            if self.llm_service:
                response = await self.llm_service.generate(prompt, {
                    'temperature': 0.1,
                    'maxTokens': 2000
                })
                sections = json.loads(response.text)
                
                if not isinstance(sections, list):
                    raise ValueError("AI returned non-array response")
                
                # Validate and clean sections
                cleaned_sections = []
                for i, section in enumerate(sections):
                    cleaned_sections.append({
                        "type": section.get("type", "experience"),
                        "content": section.get("content", ""),
                        "startIndex": section.get("startIndex", i * 100),
                        "endIndex": section.get("endIndex", (i + 1) * 100)
                    })
                
                return {
                    "data": cleaned_sections,
                    "confidence": 0.8,
                    "errors": []
                }
            else:
                return self._get_mock_sections()
                
        except Exception as e:
            logger.error(f"Section extraction failed: {e}")
            return {
                "data": [],
                "confidence": 0.0,
                "errors": [f"Extraction failed: {str(e)}"]
            }
    
    async def extract_structured_resume(self, text: str) -> Dict[str, Any]:
        """Extract structured resume data using existing LLM service"""
        prompt = f"""Extract structured resume data from the following text. Return a JSON object with this structure:
{{
  "title": "Resume title or person's name",
  "summary": "Professional summary or objective",
  "experience": [
    {{
      "role": "Job Title",
      "organization": "Company Name",
      "startDate": "2020-01",
      "endDate": "2023-12" or null for current,
      "bullets": ["Achievement 1", "Achievement 2"]
    }}
  ],
  "education": [
    {{
      "degree": "Degree Name",
      "school": "School Name",
      "graduationDate": "2020-05"
    }}
  ],
  "skills": [
    {{
      "name": "Category Name",
      "skills": ["Skill 1", "Skill 2", "Skill 3"]
    }}
  ]
}}

Guidelines:
- Use YYYY-MM format for dates
- Extract 3-5 key achievements per job
- Group skills into logical categories (Technical Skills, Languages, etc.)
- Only include information that's clearly present in the text
- Use null for missing optional fields

Resume text:
{text}

Extract structured data:"""

        try:
            if self.llm_service:
                response = await self.llm_service.generate(prompt, {
                    'temperature': 0.1,
                    'maxTokens': 3000
                })
                resume = json.loads(response.text)
                
                # Validate and clean the response
                cleaned_resume = {
                    "title": resume.get("title", ""),
                    "summary": resume.get("summary", ""),
                    "experience": resume.get("experience", []) if isinstance(resume.get("experience"), list) else [],
                    "education": resume.get("education", []) if isinstance(resume.get("education"), list) else [],
                    "skills": resume.get("skills", []) if isinstance(resume.get("skills"), list) else []
                }
                
                return {
                    "data": cleaned_resume,
                    "confidence": 0.85,
                    "errors": []
                }
            else:
                return self._get_mock_structured_resume()
                
        except Exception as e:
            logger.error(f"Structured extraction failed: {e}")
            return {
                "data": {
                    "title": "",
                    "summary": "",
                    "experience": [],
                    "education": [],
                    "skills": []
                },
                "confidence": 0.0,
                "errors": [f"Extraction failed: {str(e)}"]
            }
    
    async def extract_comprehensive_resume(self, text: str) -> Dict[str, Any]:
        """Comprehensive resume extraction combining all methods"""
        try:
            # Run all extractions in parallel
            personal_info_task = self.extract_personal_info(text)
            sections_task = self.extract_resume_sections(text)
            structured_task = self.extract_structured_resume(text)
            
            personal_info_result = await personal_info_task
            sections_result = await sections_task
            structured_result = await structured_task
            
            # Calculate overall confidence
            confidences = [
                personal_info_result.get("confidence", 0),
                sections_result.get("confidence", 0),
                structured_result.get("confidence", 0)
            ]
            overall_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Collect all errors
            all_errors = []
            all_errors.extend(personal_info_result.get("errors", []))
            all_errors.extend(sections_result.get("errors", []))
            all_errors.extend(structured_result.get("errors", []))
            
            return {
                "success": True,
                "data": {
                    "personal_info": personal_info_result.get("data"),
                    "sections": sections_result.get("data", []),
                    "structured_resume": structured_result.get("data", {})
                },
                "confidence": overall_confidence,
                "errors": all_errors
            }
            
        except Exception as e:
            logger.error(f"Comprehensive extraction failed: {e}")
            return {
                "success": False,
                "data": None,
                "confidence": 0.0,
                "errors": [f"Comprehensive extraction failed: {str(e)}"]
            }
    
    async def improve_content(self, content: str, improvement_type: str = "general", context: Optional[str] = None) -> Dict[str, Any]:
        """Improve resume content using existing LLM service"""
        prompts = {
            "general": f"Improve the following resume content to make it more professional and impactful:\n\n{content}",
            "summary": f"Improve this professional summary to make it more compelling and specific:\n\n{content}",
            "experience": f"Improve this work experience description to highlight achievements and impact:\n\n{content}",
            "skills": f"Improve this skills section to be more specific and relevant:\n\n{content}"
        }
        
        prompt = prompts.get(improvement_type, prompts["general"])
        
        if context:
            prompt += f"\n\nContext: {context}"
        
        try:
            if self.llm_service:
                response = await self.llm_service.generate(prompt, {
                    'temperature': 0.7,
                    'maxTokens': 1000
                })
                
                # Generate suggestions
                suggestions_prompt = f"Provide 3-5 specific suggestions to improve this resume content:\n\n{content}"
                suggestions_response = await self.llm_service.generate(suggestions_prompt, {
                    'temperature': 0.6,
                    'maxTokens': 500
                })
                
                return {
                    "improved_content": response.text,
                    "suggestions": suggestions_response.text.split('\n') if suggestions_response.text else [],
                    "confidence": 0.8,
                    "errors": []
                }
            else:
                return self._get_mock_improvement()
                
        except Exception as e:
            logger.error(f"Content improvement failed: {e}")
            return {
                "improved_content": None,
                "suggestions": None,
                "confidence": 0.0,
                "errors": [f"Improvement failed: {str(e)}"]
            }
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get AI service health status"""
        try:
            if not self.llm_service:
                return {
                    "provider": "mock",
                    "can_use_real_ai": False,
                    "rate_limit_status": {}
                }
            
            # Get health info from existing service
            phase_info = self.llm_service.getPhaseInfo()
            rate_limit_status = self.llm_service.getRateLimitStatus()
            
            return {
                "provider": phase_info.provider,
                "can_use_real_ai": phase_info.canUseRealAI,
                "rate_limit_status": rate_limit_status
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "provider": "error",
                "can_use_real_ai": False,
                "rate_limit_status": {
                    "status": "error",
                    "error": str(e)
                }
            }
    
    def _get_mock_personal_info(self) -> Dict[str, Any]:
        """Mock personal info for development"""
        return {
            "data": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1234567890",
                "linkedin": "https://linkedin.com/in/johndoe",
                "github": "https://github.com/johndoe"
            },
            "confidence": 0.2,
            "errors": ["Using mock response - LLM service not available"]
        }
    
    def _get_mock_sections(self) -> Dict[str, Any]:
        """Mock sections for development"""
        return {
            "data": [
                {"type": "title", "content": "John Doe", "startIndex": 0, "endIndex": 8},
                {"type": "summary", "content": "Experienced software engineer", "startIndex": 10, "endIndex": 40}
            ],
            "confidence": 0.2,
            "errors": ["Using mock response - LLM service not available"]
        }
    
    def _get_mock_structured_resume(self) -> Dict[str, Any]:
        """Mock structured resume for development"""
        return {
            "data": {
                "title": "John Doe",
                "summary": "Experienced software engineer",
                "experience": [],
                "education": [],
                "skills": []
            },
            "confidence": 0.2,
            "errors": ["Using mock response - LLM service not available"]
        }
    
    def _get_mock_improvement(self) -> Dict[str, Any]:
        """Mock improvement for development"""
        return {
            "improved_content": "Mock improved content",
            "suggestions": ["Mock suggestion 1", "Mock suggestion 2"],
            "confidence": 0.2,
            "errors": ["Using mock response - LLM service not available"]
        }
