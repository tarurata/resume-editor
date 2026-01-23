"""
Database models for Resume Editor
Pydantic models for database operations
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
import json


class PersonalInfo(BaseModel):
    """Personal information model"""
    id: Optional[str] = None
    user_id: str
    full_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=100)
    linkedin_url: Optional[str] = Field(None, max_length=200)
    portfolio_url: Optional[str] = Field(None, max_length=200)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        import re
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', v):
            raise ValueError('Invalid email format')
        return v


class Education(BaseModel):
    """Education model"""
    id: Optional[str] = None
    user_id: str
    degree: str = Field(..., min_length=1, max_length=100)
    institution: str = Field(..., min_length=1, max_length=100)
    field_of_study: str = Field(..., min_length=1, max_length=100)
    graduation_date: str = Field(..., description="YYYY-MM format")
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    location: Optional[str] = Field(None, max_length=100)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator('graduation_date')
    @classmethod
    def validate_graduation_date(cls, v):
        import re
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM format')
        return v


class Certification(BaseModel):
    """Certification model"""
    id: Optional[str] = None
    user_id: str
    name: str = Field(..., min_length=1, max_length=100)
    issuer: str = Field(..., min_length=1, max_length=100)
    issue_date: str = Field(..., description="YYYY-MM format")
    expiry_date: Optional[str] = Field(None, description="YYYY-MM format")
    credential_id: Optional[str] = Field(None, max_length=100)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator('issue_date', 'expiry_date')
    @classmethod
    def validate_date_format(cls, v):
        if v is None:
            return v
        import re
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM format')
        return v


class Experience(BaseModel):
    """Experience model for work experience entries"""
    id: Optional[str] = None
    resume_version_id: str
    role: str = Field(..., min_length=1, max_length=100)
    organization: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    start_date: str = Field(..., description="YYYY-MM format")
    end_date: Optional[str] = Field(None, description="YYYY-MM format or null for current")
    order_index: int = Field(0, ge=0)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        if v is None:
            return v
        import re
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM format')
        return v


class Achievement(BaseModel):
    """Achievement model for key achievements within experiences"""
    id: Optional[str] = None
    experience_id: str
    achievement_text: str = Field(..., min_length=1, max_length=500)
    order_index: int = Field(0, ge=0)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ResumeVersion(BaseModel):
    """Resume version model for multi-company management"""
    id: Optional[str] = None
    user_id: str
    company_name: str = Field(..., min_length=1, max_length=100)
    company_email: str = Field(..., min_length=1, max_length=100)
    company_url: Optional[str] = None
    job_title: str = Field(..., min_length=1, max_length=100)
    job_description: Optional[str] = None
    resume_data: dict = Field(..., description="JSON data of resume")
    is_active: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator('company_email')
    @classmethod
    def validate_company_email(cls, v):
        import re
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', v):
            raise ValueError('Invalid email format')
        return v

    @field_validator('company_url')
    @classmethod
    def validate_company_url(cls, v):
        if v is None or v == '':
            return v
        import re
        # Basic URL validation
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        if not url_pattern.match(v):
            raise ValueError('Invalid URL format')
        return v


class ResumeHistory(BaseModel):
    """Resume history model for tracking changes"""
    id: Optional[str] = None
    resume_version_id: str
    change_type: Literal['create', 'update', 'delete']
    section_changed: str = Field(..., min_length=1, max_length=50)
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    change_reason: Optional[str] = Field(None, max_length=500)
    created_at: Optional[datetime] = None


class Application(BaseModel):
    """Application tracking model"""
    id: Optional[str] = None
    resume_version_id: str
    company: str = Field(..., min_length=1, max_length=100)
    position: str = Field(..., min_length=1, max_length=100)
    application_date: date
    status: Literal['applied', 'interview', 'rejected', 'offer', 'withdrawn']
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class Template(BaseModel):
    """Resume template model"""
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    industry: Optional[str] = Field(None, max_length=50)
    template_data: dict = Field(..., description="JSON data of template")
    is_public: bool = False
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Extended Resume model that includes all new fields
class ExtendedResume(BaseModel):
    """Extended resume model with all database fields"""
    # Core resume fields (existing)
    title: str = Field(..., min_length=1, max_length=100)
    summary: str = Field(..., min_length=1, max_length=500)
    experience: List[dict] = Field(..., min_items=1)  # ExperienceEntry from existing model
    skills: List[str] = Field(..., min_items=1)
    
    # New database fields
    personal_info: Optional[PersonalInfo] = None
    education: List[Education] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)
    
    # Metadata
    facts_inventory: Optional[dict] = None  # Existing FactsInventory as dict


# Database operation models
class ResumeVersionCreate(BaseModel):
    """Model for creating a new resume version"""
    company_name: str = Field(..., min_length=1, max_length=100)
    company_email: str = Field(..., min_length=1, max_length=100)
    company_url: Optional[str] = None
    job_title: str = Field(..., min_length=1, max_length=100)
    job_description: Optional[str] = None
    resume_data: dict = Field(..., description="JSON data of resume")


class ResumeVersionUpdate(BaseModel):
    """Model for updating a resume version"""
    company_name: Optional[str] = Field(None, min_length=1, max_length=100)
    company_email: Optional[str] = Field(None, min_length=1, max_length=100)
    company_url: Optional[str] = None
    job_title: Optional[str] = Field(None, min_length=1, max_length=100)
    job_description: Optional[str] = None
    resume_data: Optional[dict] = None
    is_active: Optional[bool] = None


class ApplicationCreate(BaseModel):
    """Model for creating a new application"""
    resume_version_id: str
    company: str = Field(..., min_length=1, max_length=100)
    position: str = Field(..., min_length=1, max_length=100)
    application_date: date
    status: Literal['applied', 'interview', 'rejected', 'offer', 'withdrawn'] = 'applied'
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None


class ApplicationUpdate(BaseModel):
    """Model for updating an application"""
    company: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[str] = Field(None, min_length=1, max_length=100)
    application_date: Optional[date] = None
    status: Optional[Literal['applied', 'interview', 'rejected', 'offer', 'withdrawn']] = None
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None


class ExperienceCreate(BaseModel):
    """Model for creating a new experience entry"""
    resume_version_id: str
    role: str = Field(..., min_length=1, max_length=100)
    organization: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    start_date: str = Field(..., description="YYYY-MM format")
    end_date: Optional[str] = Field(None, description="YYYY-MM format or null for current")
    order_index: int = Field(0, ge=0)

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        if v is None:
            return v
        import re
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM format')
        return v


class ExperienceUpdate(BaseModel):
    """Model for updating an experience entry"""
    role: Optional[str] = Field(None, min_length=1, max_length=100)
    organization: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    start_date: Optional[str] = Field(None, description="YYYY-MM format")
    end_date: Optional[str] = Field(None, description="YYYY-MM format or null for current")
    order_index: Optional[int] = Field(None, ge=0)

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        if v is None:
            return v
        import re
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM format')
        return v


class AchievementCreate(BaseModel):
    """Model for creating a new achievement"""
    experience_id: str
    achievement_text: str = Field(..., min_length=1, max_length=500)
    order_index: int = Field(0, ge=0)


class AchievementUpdate(BaseModel):
    """Model for updating an achievement"""
    achievement_text: Optional[str] = Field(None, min_length=1, max_length=500)
    order_index: Optional[int] = Field(None, ge=0)


class User(BaseModel):
    """User model for database representation"""
    id: Optional[str] = None
    email: str
    hashed_password: str
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserCreate(BaseModel):
    """User model for registration"""
    email: str
    password: str
