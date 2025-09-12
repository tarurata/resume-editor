"""
Database migration script for Resume Editor
Migrates existing localStorage data to SQLite database
"""

import json
import sqlite3
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

from .database import DatabaseService
from .models import PersonalInfo, Education, Certification, ResumeVersionCreate


class DatabaseMigration:
    """Handle migration from localStorage to SQLite database"""
    
    def __init__(self, db_service: DatabaseService):
        self.db_service = db_service
    
    def migrate_from_localStorage(self, localStorage_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Migrate data from localStorage format to database
        
        Args:
            localStorage_data: Data from browser localStorage
            user_id: User ID for the migration
            
        Returns:
            Migration results with created IDs
        """
        results = {
            "personal_info_id": None,
            "education_ids": [],
            "certification_ids": [],
            "resume_version_ids": [],
            "errors": []
        }
        
        try:
            # Extract personal info from resume data
            if "personal_info" in localStorage_data:
                personal_info_data = localStorage_data["personal_info"]
                personal_info = PersonalInfo(
                    user_id=user_id,
                    full_name=personal_info_data.get("full_name", ""),
                    email=personal_info_data.get("email", ""),
                    phone=personal_info_data.get("phone"),
                    location=personal_info_data.get("location"),
                    linkedin_url=personal_info_data.get("linkedin_url"),
                    portfolio_url=personal_info_data.get("portfolio_url")
                )
                created_personal_info = self.db_service.create_personal_info(personal_info)
                results["personal_info_id"] = created_personal_info.id
            else:
                # Try to extract from resume data
                resume_data = localStorage_data.get("resume", {})
                if resume_data:
                    # Create basic personal info from resume title
                    personal_info = PersonalInfo(
                        user_id=user_id,
                        full_name="",  # Will need to be filled manually
                        email="",  # Will need to be filled manually
                        phone=None,
                        location=None,
                        linkedin_url=None,
                        portfolio_url=None
                    )
                    created_personal_info = self.db_service.create_personal_info(personal_info)
                    results["personal_info_id"] = created_personal_info.id
            
            # Migrate education data
            if "education" in localStorage_data:
                for edu_data in localStorage_data["education"]:
                    education = Education(
                        user_id=user_id,
                        degree=edu_data.get("degree", ""),
                        institution=edu_data.get("institution", ""),
                        field_of_study=edu_data.get("field_of_study", ""),
                        graduation_date=edu_data.get("graduation_date", ""),
                        gpa=edu_data.get("gpa"),
                        location=edu_data.get("location")
                    )
                    created_education = self.db_service.create_education(education)
                    results["education_ids"].append(created_education.id)
            
            # Migrate certifications data
            if "certifications" in localStorage_data:
                for cert_data in localStorage_data["certifications"]:
                    certification = Certification(
                        user_id=user_id,
                        name=cert_data.get("name", ""),
                        issuer=cert_data.get("issuer", ""),
                        issue_date=cert_data.get("issue_date", ""),
                        expiry_date=cert_data.get("expiry_date"),
                        credential_id=cert_data.get("credential_id")
                    )
                    created_certification = self.db_service.create_certification(certification)
                    results["certification_ids"].append(created_certification.id)
            
            # Migrate resume versions
            if "resume_versions" in localStorage_data:
                for version_data in localStorage_data["resume_versions"]:
                    resume_version_create = ResumeVersionCreate(
                        company_name=version_data.get("company_name", ""),
                        company_email=version_data.get("company_email", ""),
                        job_title=version_data.get("job_title", ""),
                        job_description=version_data.get("job_description"),
                        resume_data=version_data.get("resume_data", {})
                    )
                    created_version = self.db_service.create_resume_version(resume_version_create, user_id)
                    results["resume_version_ids"].append(created_version.id)
            else:
                # Migrate single resume as a version
                resume_data = localStorage_data.get("resume", {})
                if resume_data:
                    resume_version_create = ResumeVersionCreate(
                        company_name="Default",
                        company_email="",
                        job_title=resume_data.get("title", ""),
                        job_description="",
                        resume_data=resume_data
                    )
                    created_version = self.db_service.create_resume_version(resume_version_create, user_id)
                    results["resume_version_ids"].append(created_version.id)
            
        except Exception as e:
            results["errors"].append(f"Migration error: {str(e)}")
        
        return results
    
    def export_to_localStorage_format(self, user_id: str) -> Dict[str, Any]:
        """
        Export database data back to localStorage format for frontend compatibility
        
        Args:
            user_id: User ID to export data for
            
        Returns:
            Data in localStorage format
        """
        export_data = {
            "personal_info": None,
            "education": [],
            "certifications": [],
            "resume_versions": [],
            "applications": []
        }
        
        try:
            # Export personal info
            personal_info = self.db_service.get_personal_info(user_id)
            if personal_info:
                export_data["personal_info"] = {
                    "id": personal_info.id,
                    "full_name": personal_info.full_name,
                    "email": personal_info.email,
                    "phone": personal_info.phone,
                    "location": personal_info.location,
                    "linkedin_url": personal_info.linkedin_url,
                    "portfolio_url": personal_info.portfolio_url
                }
            
            # Export education
            education_list = self.db_service.get_education(user_id)
            for education in education_list:
                export_data["education"].append({
                    "id": education.id,
                    "degree": education.degree,
                    "institution": education.institution,
                    "field_of_study": education.field_of_study,
                    "graduation_date": education.graduation_date,
                    "gpa": education.gpa,
                    "location": education.location
                })
            
            # Export certifications
            certifications = self.db_service.get_certifications(user_id)
            for certification in certifications:
                export_data["certifications"].append({
                    "id": certification.id,
                    "name": certification.name,
                    "issuer": certification.issuer,
                    "issue_date": certification.issue_date,
                    "expiry_date": certification.expiry_date,
                    "credential_id": certification.credential_id
                })
            
            # Export resume versions
            resume_versions = self.db_service.get_resume_versions(user_id)
            for version in resume_versions:
                export_data["resume_versions"].append({
                    "id": version.id,
                    "company_name": version.company_name,
                    "company_email": version.company_email,
                    "job_title": version.job_title,
                    "job_description": version.job_description,
                    "resume_data": version.resume_data,
                    "is_active": version.is_active,
                    "created_at": version.created_at.isoformat() if version.created_at else None,
                    "updated_at": version.updated_at.isoformat() if version.updated_at else None
                })
            
            # Export applications
            applications = self.db_service.get_applications(user_id)
            for application in applications:
                export_data["applications"].append({
                    "id": application.id,
                    "resume_version_id": application.resume_version_id,
                    "company": application.company,
                    "position": application.position,
                    "application_date": application.application_date.isoformat() if application.application_date else None,
                    "status": application.status,
                    "notes": application.notes,
                    "follow_up_date": application.follow_up_date.isoformat() if application.follow_up_date else None
                })
        
        except Exception as e:
            print(f"Export error: {str(e)}")
        
        return export_data
    
    def migrate_from_json_file(self, json_file_path: str, user_id: str) -> Dict[str, Any]:
        """
        Migrate from JSON file to database
        
        Args:
            json_file_path: Path to JSON file
            user_id: User ID for the migration
            
        Returns:
            Migration results
        """
        try:
            with open(json_file_path, 'r') as f:
                data = json.load(f)
            return self.migrate_from_localStorage(data, user_id)
        except Exception as e:
            return {"errors": [f"File migration error: {str(e)}"]}
    
    def create_backup(self, user_id: str, backup_path: str) -> bool:
        """
        Create backup of user data
        
        Args:
            user_id: User ID to backup
            backup_path: Path to save backup file
            
        Returns:
            Success status
        """
        try:
            export_data = self.export_to_localStorage_format(user_id)
            with open(backup_path, 'w') as f:
                json.dump(export_data, f, indent=2, default=str)
            return True
        except Exception as e:
            print(f"Backup error: {str(e)}")
            return False


def migrate_existing_data():
    """Migration script for existing data"""
    db_service = DatabaseService()
    migration = DatabaseMigration(db_service)
    
    # Example migration from sample data
    sample_file = Path(__file__).parent.parent / "fixtures" / "sample-resume.json"
    if sample_file.exists():
        print("Migrating sample resume data...")
        results = migration.migrate_from_json_file(str(sample_file), "sample_user")
        print(f"Migration results: {results}")
    
    return migration


if __name__ == "__main__":
    migrate_existing_data()
