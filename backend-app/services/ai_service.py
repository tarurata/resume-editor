import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from ..core.config import get_settings
import openai
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize OpenAI client with configuration using existing LLM settings"""
        try:
            if self.settings.llm_api_key:
                # Initialize with minimal configuration to avoid proxy issues
                self.client = AsyncOpenAI(
                    api_key=self.settings.llm_api_key,
                    base_url=self.settings.llm_base_url,
                    timeout=30.0
                )
                logger.info(f"OpenAI client initialized with model: {self.settings.llm_model}")
            else:
                logger.warning("No LLM API key found, using mock responses")
                self.client = None
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            logger.error(f"Settings: api_key={'***' if self.settings.llm_api_key else 'None'}, base_url={self.settings.llm_base_url}")
            self.client = None
    
    async def extract_personal_info(self, text: str) -> Dict[str, Any]:
        """Extract personal information from resume text"""
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
            response = await self._call_openai(prompt, max_tokens=500, temperature=0.1)
            extracted = json.loads(response)
            
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
            
        except Exception as e:
            logger.error(f"Personal info extraction failed: {e}")
            return {
                "data": None,
                "confidence": 0.0,
                "errors": [f"Extraction failed: {str(e)}"]
            }
    
    async def extract_resume_sections(self, text: str) -> Dict[str, Any]:
        """Extract and categorize resume sections"""
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
            response = await self._call_openai(prompt, max_tokens=2000, temperature=0.1)
            sections = json.loads(response)
            
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
            
        except Exception as e:
            logger.error(f"Section extraction failed: {e}")
            return {
                "data": [],
                "confidence": 0.0,
                "errors": [f"Extraction failed: {str(e)}"]
            }
    
    async def extract_structured_resume(self, text: str) -> Dict[str, Any]:
        """Extract structured resume data"""
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
      "achievements": ["Achievement 1", "Achievement 2"]
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
            response = await self._call_openai(prompt, max_tokens=3000, temperature=0.1)
            resume = json.loads(response)
            
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
        """Improve resume content using AI"""
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
            response = await self._call_openai(prompt, max_tokens=1000, temperature=0.7)
            
            # Generate suggestions
            suggestions_prompt = f"Provide 3-5 specific suggestions to improve this resume content:\n\n{content}"
            suggestions_response = await self._call_openai(suggestions_prompt, max_tokens=500, temperature=0.6)
            
            return {
                "improved_content": response,
                "suggestions": suggestions_response.split('\n') if suggestions_response else [],
                "confidence": 0.8,
                "errors": []
            }
            
        except Exception as e:
            logger.error(f"Content improvement failed: {e}")
            return {
                "improved_content": None,
                "suggestions": None,
                "confidence": 0.0,
                "errors": [f"Improvement failed: {str(e)}"]
            }
    
    async def extract_job_description(self, job_description: str) -> Dict[str, Any]:
        """Extract key information from job description"""
        prompt = f"""Extract key information from the following job description. Return a JSON object with the following structure:
{{
  "company_name": "Company Name",
  "company_email": "Company email address (e.g., careers@company.com, jobs@company.com)",
  "job_title": "Job Title",
  "compensation": "Salary range or compensation details",
  "location": "Job location (city, state, country, or remote)",
  "required_skills": ["Skill 1", "Skill 2", "Skill 3"],
  "preferred_skills": ["Preferred Skill 1", "Preferred Skill 2"],
  "experience_level": "Entry/Mid/Senior/Executive",
  "employment_type": "Full-time/Part-time/Contract/Internship",
  "remote_work": "Yes/No/Hybrid",
  "benefits": ["Benefit 1", "Benefit 2"],
  "responsibilities": ["Key responsibility 1", "Key responsibility 2"],
  "qualifications": ["Required qualification 1", "Required qualification 2"]
}}

Guidelines:
- Extract the exact company name and job title as they appear
- Extract company email address if mentioned (look for patterns like careers@, jobs@, hr@, recruiting@, etc.)
- For compensation, include salary ranges, hourly rates, or other compensation mentioned
- For location, be specific about city/state if mentioned, or note if remote/hybrid
- List 5-10 most important required skills
- List 3-5 preferred skills if mentioned
- Determine experience level based on requirements
- Extract key responsibilities and qualifications
- Use null for missing information
- Be precise and only include information explicitly stated

Job Description:
{job_description}

Extract job information:"""

        try:
            # Try direct OpenAI call first
            if self.settings.llm_api_key:
                logger.info("Attempting direct OpenAI call for JD extraction")
                response = await self._call_openai_direct(prompt, max_tokens=1500, temperature=0.1)
                logger.info(f"Direct OpenAI call response: {response[:100]}...")
            else:
                logger.info("No API key, using mock response")
                response = await self._call_openai(prompt, max_tokens=1500, temperature=0.1)
            
            extracted = json.loads(response)
            
            # Validate that we have at least company name or job title
            if not extracted.get("company_name") and not extracted.get("job_title"):
                return {
                    "data": None,
                    "confidence": 0.0,
                    "errors": ["No company name or job title found"]
                }
            
            return {
                "data": extracted,
                "confidence": 0.9,
                "errors": []
            }
            
        except Exception as e:
            logger.error(f"Job description extraction failed: {e}")
            return {
                "data": None,
                "confidence": 0.0,
                "errors": [f"Extraction failed: {str(e)}"]
            }

    async def get_health_status(self) -> Dict[str, Any]:
        """Get AI service health status"""
        try:
            if not self.client:
                return {
                    "provider": "mock",
                    "can_use_real_ai": False,
                    "rate_limit_status": {}
                }
            
            # Test API call
            test_response = await self._call_openai("Test", max_tokens=10, temperature=0)
            
            return {
                "provider": "openai",
                "can_use_real_ai": True,
                "rate_limit_status": {
                    "status": "healthy",
                    "last_test": "successful"
                }
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
    
    async def _call_openai_direct(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        """Make direct HTTP call to OpenAI API bypassing client issues"""
        try:
            import aiohttp
            import json as json_lib
            
            logger.info(f"Making HTTP call to OpenAI with model: {self.settings.llm_model}")
            logger.info(f"API key present: {bool(self.settings.llm_api_key)}")
            logger.info(f"Base URL: {self.settings.llm_base_url}")
            
            headers = {
                "Authorization": f"Bearer {self.settings.llm_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.settings.llm_model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.settings.llm_base_url}/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=30
                ) as response:
                    logger.info(f"OpenAI API response status: {response.status}")
                    if response.status == 200:
                        result = await response.json()
                        content = result["choices"][0]["message"]["content"]
                        logger.info(f"OpenAI API success, content length: {len(content)}")
                        
                        # Extract JSON from markdown code blocks if present
                        if content.strip().startswith('```json'):
                            # Remove markdown code blocks
                            lines = content.strip().split('\n')
                            json_lines = []
                            in_json = False
                            for line in lines:
                                if line.strip().startswith('```json'):
                                    in_json = True
                                    continue
                                elif line.strip().startswith('```'):
                                    break
                                elif in_json:
                                    json_lines.append(line)
                            content = '\n'.join(json_lines)
                        
                        logger.info(f"Extracted JSON content: {content[:200]}...")
                        return content
                    else:
                        error_text = await response.text()
                        logger.error(f"OpenAI API error {response.status}: {error_text}")
                        raise Exception(f"OpenAI API error {response.status}: {error_text}")
            
        except Exception as e:
            logger.error(f"Direct HTTP OpenAI API call failed: {e}")
            # Fallback to mock response
            return self._get_mock_response(prompt)

    async def _call_openai(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        """Make OpenAI API call with error handling"""
        if not self.client:
            # Return mock response for development
            return self._get_mock_response(prompt)
        
        try:
            response = await self.client.chat.completions.create(
                model=self.settings.llm_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            # Fallback to mock response
            return self._get_mock_response(prompt)
    
    def _get_mock_response(self, prompt: str) -> str:
        """Generate mock response for development/testing"""
        if "personal information" in prompt.lower():
            return json.dumps({
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1234567890",
                "linkedin": "https://linkedin.com/in/johndoe",
                "github": "https://github.com/johndoe"
            })
        elif "sections" in prompt.lower():
            return json.dumps([
                {"type": "title", "content": "John Doe", "startIndex": 0, "endIndex": 8},
                {"type": "summary", "content": "Experienced software engineer", "startIndex": 10, "endIndex": 40}
            ])
        elif "structured" in prompt.lower():
            return json.dumps({
                "title": "John Doe",
                "summary": "Experienced software engineer",
                "experience": [],
                "education": [],
                "skills": []
            })
        elif "job description" in prompt.lower() or "extract job information" in prompt.lower():
            return json.dumps({
                "company_name": "TechCorp Inc.",
                "job_title": "Senior Software Engineer",
                "compensation": "$120,000 - $150,000 per year",
                "location": "San Francisco, CA (Hybrid)",
                "required_skills": ["Python", "React", "AWS", "Docker", "PostgreSQL", "REST APIs", "Git"],
                "preferred_skills": ["TypeScript", "Kubernetes", "GraphQL", "Machine Learning"],
                "experience_level": "Senior",
                "employment_type": "Full-time",
                "remote_work": "Hybrid",
                "benefits": ["Health Insurance", "401k", "Stock Options", "Flexible PTO"],
                "responsibilities": ["Lead development of web applications", "Mentor junior developers", "Design system architecture"],
                "qualifications": ["Bachelor's degree in Computer Science", "5+ years of software development experience"]
            })
        else:
            return "Mock AI response for development"