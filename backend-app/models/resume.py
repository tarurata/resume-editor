from typing import List, Optional, Literal, Dict, Set
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import json


class DateRange(BaseModel):
    """Date range for experience entries and facts inventory"""
    start: str = Field(
        ..., 
        description="Start date in YYYY-MM format",
        example="2021-03"
    )
    end: Optional[str] = Field(
        None,
        description="End date in YYYY-MM format, null for current position",
        example="2023-12"
    )

    @field_validator('start', 'end')
    @classmethod
    def validate_date_format(cls, v):
        if v is None or v == '':
            return None
        import re
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM format')
        return v


class ExperienceEntry(BaseModel):
    """Individual work experience entry"""
    role: str = Field(
        ...,
        description="Job title or role",
        min_length=1,
        max_length=100,
        example="Senior Software Engineer"
    )
    organization: str = Field(
        ...,
        description="Company or organization name",
        min_length=1,
        max_length=100,
        example="TechCorp Inc."
    )
    location: Optional[str] = Field(
        None,
        description="Work location (city, state/country)",
        max_length=100,
        example="San Francisco, CA"
    )
    startDate: str = Field(
        ...,
        description="Start date in YYYY-MM format",
        example="2021-03"
    )
    endDate: Optional[str] = Field(
        None,
        description="End date in YYYY-MM format, null for current position",
        example=None
    )
    achievements: List[str] = Field(
        ...,
        description="Array of achievement/description bullets",
        min_items=1,
        max_items=10,
        example=[
            "Led development of microservices architecture serving 1M+ daily active users",
            "Improved application performance by 40% through code optimization and caching strategies"
        ]
    )

    @field_validator('achievements')
    @classmethod
    def validate_bullets(cls, v):
        for bullet in v:
            if len(bullet.strip()) == 0:
                raise ValueError("Bullets cannot be empty")
            if len(bullet) > 200:
                raise ValueError("Bullets must be 200 characters or less")
        return v

    @field_validator('startDate', 'endDate')
    @classmethod
    def validate_date_format(cls, v):
        if v is None or v == '':
            return None
        import re
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM format')
        return v


class SkillSubsection(BaseModel):
    """Individual skill subsection with flexible category name"""
    name: str = Field(
        ...,
        description="Name of the skill subsection/category",
        min_length=1,
        max_length=50,
        example="Programming Languages"
    )
    skills: List[str] = Field(
        ...,
        description="Array of skills in this subsection",
        min_items=1,
        max_items=50,
        example=["JavaScript", "TypeScript", "Python"]
    )

    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        if len(set(v)) != len(v):
            raise ValueError("Skills within a subsection must be unique")
        for skill in v:
            if len(skill.strip()) == 0:
                raise ValueError("Skills cannot be empty")
            if len(skill) > 50:
                raise ValueError("Skills must be 50 characters or less")
        return v


class FactsInventory(BaseModel):
    """Facts inventory for guardrails and validation"""
    skills: List[str] = Field(
        ...,
        description="Validated skills list for guardrails",
        example=["JavaScript", "TypeScript", "React", "Node.js"]
    )
    organizations: List[str] = Field(
        ...,
        description="Validated organization names for guardrails",
        example=["TechCorp Inc.", "StartupXYZ", "WebDev Solutions"]
    )
    roles: List[str] = Field(
        ...,
        description="Validated job roles/titles for guardrails",
        example=["Senior Software Engineer", "Software Engineer", "Junior Developer"]
    )
    dates: List[DateRange] = Field(
        ...,
        description="Validated date ranges for guardrails",
        example=[
            {"start": "2021-03", "end": None},
            {"start": "2019-06", "end": "2021-02"}
        ]
    )
    certifications: List[str] = Field(
        default_factory=list,
        description="Validated certifications for guardrails",
        example=["AWS Certified Developer", "Google Cloud Professional Developer"]
    )


class Resume(BaseModel):
    """Complete resume data model"""
    title: str = Field(
        ...,
        description="Resume title or professional headline",
        min_length=1,
        max_length=100,
        example="Senior Software Engineer"
    )
    summary: str = Field(
        ...,
        description="Professional summary or objective",
        min_length=1,
        max_length=500,
        example="Experienced full-stack developer with 5+ years building scalable web applications using React, Node.js, and cloud technologies."
    )
    experience: List[ExperienceEntry] = Field(
        ...,
        description="Array of work experience entries",
        example=[
            {
                "role": "Senior Software Engineer",
                "organization": "TechCorp Inc.",
                "location": "San Francisco, CA",
                "startDate": "2021-03",
                "endDate": None,
                "achievements": [
                    "Led development of microservices architecture serving 1M+ daily active users",
                    "Improved application performance by 40% through code optimization and caching strategies"
                ]
            }
        ]
    )
    skills: Optional[List['SkillSubsection']] = Field(
        None,
        description="Array of skill subsections with flexible category names",
        example=[
            {"name": "Programming Languages", "skills": ["JavaScript", "TypeScript", "Python"]},
            {"name": "Frameworks", "skills": ["React", "Node.js", "Express"]},
            {"name": "Cloud & DevOps", "skills": ["AWS", "Docker", "Kubernetes"]}
        ]
    )
    factsInventory: Optional[FactsInventory] = Field(
        None,
        description="Facts inventory for guardrails and validation"
    )

    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        if v is None:
            return None

        # Check for unique subsection names
        subsection_names = [subsection.name for subsection in v if hasattr(subsection, 'name')]
        if len(set(subsection_names)) != len(subsection_names):
            raise ValueError("Skill subsection names must be unique")
        
        # Validate each subsection
        for subsection in v:
            if hasattr(subsection, 'name') and len(subsection.name.strip()) == 0:
                raise ValueError("Skill subsection names cannot be empty")
        
        return v


class ResumeVersion(BaseModel):
    id: str = Field(..., description="Unique identifier for the resume version")
    user_id: str = Field(..., description="The user this resume version belongs to")
    company_name: str = Field(..., description="Company name for this version")
    company_email: Optional[str] = Field(None, description="Company email for this version")
    company_url: Optional[str] = Field(None, description="Company website URL")
    job_title: str = Field(..., description="Job title for this version")
    job_description: Optional[str] = Field(None, description="Job description for this version")
    resume_data: Resume = Field(..., description="The actual resume data")
    is_active: bool = Field(False, description="Is this the active resume version?")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            'resume_data': lambda v: v.json() if isinstance(v, Resume) else v
        }
        json_deserializers = {
            'resume_data': lambda v: Resume.parse_raw(v) if isinstance(v, str) else v
        }

# API Request/Response Models

SectionType = Literal["title", "summary", "experience", "skills"]
EditAction = Literal["accept", "reject", "restore"]


class EditRequest(BaseModel):
    """Request model for editing resume sections"""
    sectionId: str = Field(
        ...,
        description="Unique identifier for the section being edited",
        example="experience_0"
    )
    sectionType: SectionType = Field(
        ...,
        description="Type of section being edited",
        example="experience"
    )
    originalContent: str = Field(
        ...,
        description="Original content of the section",
        example="Led development of microservices architecture serving 1M+ daily active users"
    )
    newContent: str = Field(
        ...,
        description="New content for the section",
        example="Led development of microservices architecture serving 2M+ daily active users"
    )
    rationale: Optional[str] = Field(
        None,
        description="Explanation for the edit",
        max_length=500,
        example="Updated user count to reflect current metrics"
    )
    action: EditAction = Field(
        ...,
        description="Action to perform on the edit",
        example="accept"
    )
    resume: Optional[Resume] = Field(
        None,
        description="Complete resume data for fact-checking (optional)",
        example=None
    )


class EditResponse(BaseModel):
    """Response model for edit operations"""
    success: bool = Field(
        ...,
        description="Whether the edit operation was successful",
        example=True
    )
    message: str = Field(
        ...,
        description="Human-readable message about the operation result",
        example="Edit applied successfully"
    )
    sectionId: str = Field(
        ...,
        description="Identifier of the section that was edited",
        example="experience_0"
    )
    updatedContent: str = Field(
        ...,
        description="The final content of the section after the edit",
        example="Led development of microservices architecture serving 2M+ daily active users"
    )
    timestamp: datetime = Field(
        ...,
        description="Timestamp when the edit was applied",
        example="2024-01-15T10:30:00Z"
    )
    changeId: Optional[str] = Field(
        None,
        description="Unique identifier for this change (for history tracking)",
        example="chg_1234567890"
    )
    riskFlags: Optional['RiskFlags'] = Field(
        None,
        description="Risk flags indicating potential issues with the edit suggestion",
        example={
            "new_skill": ["Python", "Django"],
            "new_org": ["Facebook"],
            "unverifiable_metric": ["team of 5"]
        }
    )


class RiskFlags(BaseModel):
    """Risk flags for edit suggestions indicating potential issues"""
    new_skill: List[str] = Field(
        default_factory=list,
        description="Skills mentioned in suggestion that are not in the original resume",
        example=["Python", "Django", "Machine Learning"]
    )
    new_org: List[str] = Field(
        default_factory=list,
        description="Organizations mentioned in suggestion that are not in the original resume",
        example=["Facebook", "Netflix", "Amazon"]
    )
    unverifiable_metric: List[str] = Field(
        default_factory=list,
        description="Metrics or claims in suggestion that cannot be verified against resume data",
        example=["team of 5", "increased revenue by 200%", "served 10M users"]
    )


# Strategy-based editing models

class StrategyEditRequest(BaseModel):
    """Request model for strategy-based editing"""
    sectionId: str = Field(
        ...,
        description="Unique identifier for the section being edited",
        example="experience_0"
    )
    sectionType: SectionType = Field(
        ...,
        description="Type of section being edited",
        example="experience"
    )
    strategyId: str = Field(
        ...,
        description="Strategy to apply for editing",
        example="quantify"
    )
    currentContent: str = Field(
        ...,
        description="Current content of the section",
        example="Led development of microservices architecture serving 1M+ daily active users"
    )
    jdText: Optional[str] = Field(
        None,
        description="Job description text for context",
        example="We're looking for a Software Engineer to build scalable web applications..."
    )
    constraints: Optional[dict] = Field(
        None,
        description="Strategy-specific constraints",
        example={"maxWords": 50, "tone": "professional"}
    )


class StrategyEditResponse(BaseModel):
    """Response model for strategy-based editing"""
    sectionId: str = Field(
        ...,
        description="Identifier of the section that was edited",
        example="experience_0"
    )
    suggestion: str = Field(
        ...,
        description="Generated suggestion for the section",
        example="Led development of microservices architecture serving 2M+ daily active users, improving system performance by 40%"
    )
    rationale: Optional[str] = Field(
        None,
        description="Explanation of the suggestion",
        example="Added metrics and mirrored job description language"
    )
    strategyId: str = Field(
        ...,
        description="Strategy that was applied",
        example="quantify"
    )
    wordCount: Optional[int] = Field(
        None,
        description="Word count of the suggestion",
        example=25
    )


# Forward reference resolution
EditResponse.model_rebuild()


class ResumeVersionCreate(BaseModel):
    company_name: str
    company_email: Optional[str] = None
    company_url: Optional[str] = None
    job_title: str
    job_description: Optional[str] = None
    resume_data: Resume
    is_active: bool = True

class ResumeVersionUpdate(BaseModel):
    company_name: Optional[str] = None
    company_email: Optional[str] = None
    company_url: Optional[str] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    resume_data: Optional[Resume] = None
    is_active: Optional[bool] = None
