#!/usr/bin/env python3
"""
Database initialization script for Resume Editor
Creates and populates the SQLite database with sample data
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from database.database import DatabaseService
from database.migration import DatabaseMigration
from database.models import PersonalInfo, Education, Certification, ResumeVersionCreate
import json


def init_database():
    """Initialize database with sample data"""
    print("Initializing Resume Editor Database...")
    
    # Create database service
    db = DatabaseService("resume_editor.db")
    print("✓ Database created: resume_editor.db")
    
    # Create migration service
    migration = DatabaseMigration(db)
    
    # Sample user ID
    user_id = "sample_user"
    
    # Create sample personal info
    personal_info = PersonalInfo(
        user_id=user_id,
        full_name="John Doe",
        email="john.doe@example.com",
        phone="+1 (555) 123-4567",
        location="San Francisco, CA",
        linkedin_url="https://linkedin.com/in/johndoe",
        portfolio_url="https://johndoe.dev"
    )
    db.create_personal_info(personal_info)
    print("✓ Personal info created")
    
    # Create sample education
    education1 = Education(
        user_id=user_id,
        degree="Bachelor of Science",
        institution="University of California, Berkeley",
        field_of_study="Computer Science",
        graduation_date="2018-05",
        gpa=3.7,
        location="Berkeley, CA"
    )
    db.create_education(education1)
    
    education2 = Education(
        user_id=user_id,
        degree="Master of Science",
        institution="Stanford University",
        field_of_study="Software Engineering",
        graduation_date="2020-06",
        gpa=3.9,
        location="Stanford, CA"
    )
    db.create_education(education2)
    print("✓ Education entries created")
    
    # Create sample certifications
    cert1 = Certification(
        user_id=user_id,
        name="AWS Certified Developer",
        issuer="Amazon Web Services",
        issue_date="2021-03",
        expiry_date="2024-03",
        credential_id="AWS-DEV-123456"
    )
    db.create_certification(cert1)
    
    cert2 = Certification(
        user_id=user_id,
        name="Google Cloud Professional Developer",
        issuer="Google Cloud",
        issue_date="2021-08",
        credential_id="GCP-PROD-789012"
    )
    db.create_certification(cert2)
    print("✓ Certifications created")
    
    # Create sample resume versions
    # Version 1: TechCorp Inc.
    resume_data_1 = {
        "title": "Senior Software Engineer",
        "summary": "Experienced full-stack developer with 5+ years building scalable web applications using React, Node.js, and cloud technologies. Passionate about clean code, user experience, and mentoring junior developers.",
        "experience": [
            {
                "role": "Senior Software Engineer",
                "organization": "TechCorp Inc.",
                "location": "San Francisco, CA",
                "startDate": "2021-03",
                "endDate": None,
                "bullets": [
                    "Led development of microservices architecture serving 1M+ daily active users",
                    "Improved application performance by 40% through code optimization and caching strategies",
                    "Mentored 3 junior developers and established code review best practices",
                    "Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes"
                ]
            }
        ],
        "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "MongoDB", "Git", "Agile/Scrum", "RESTful APIs"]
    }
    
    version1 = ResumeVersionCreate(
        company_name="TechCorp Inc.",
        company_email="jobs@techcorp.com",
        job_title="Senior Software Engineer",
        job_description="We're looking for a Senior Software Engineer to join our growing team...",
        resume_data=resume_data_1
    )
    created_version1 = db.create_resume_version(version1, user_id)
    db.set_active_resume_version(created_version1.id, user_id)
    
    # Version 2: StartupXYZ
    resume_data_2 = {
        "title": "Full Stack Developer",
        "summary": "Dynamic full-stack developer with expertise in modern web technologies and startup environments. Proven ability to build and scale applications from concept to production.",
        "experience": [
            {
                "role": "Full Stack Developer",
                "organization": "StartupXYZ",
                "location": "Remote",
                "startDate": "2019-06",
                "endDate": "2021-02",
                "bullets": [
                    "Built responsive React applications with TypeScript and Redux",
                    "Developed RESTful APIs using Node.js and Express",
                    "Collaborated with design team to implement pixel-perfect UI components",
                    "Participated in agile development process with 2-week sprints"
                ]
            }
        ],
        "skills": ["JavaScript", "TypeScript", "React", "Redux", "Node.js", "Express", "MongoDB", "Git", "Agile", "Startup Experience"]
    }
    
    version2 = ResumeVersionCreate(
        company_name="StartupXYZ",
        company_email="careers@startupxyz.com",
        job_title="Full Stack Developer",
        job_description="Join our fast-paced startup as a Full Stack Developer...",
        resume_data=resume_data_2
    )
    created_version2 = db.create_resume_version(version2, user_id)
    
    print("✓ Resume versions created")
    
    # Create sample applications
    from database.models import ApplicationCreate
    from datetime import date
    
    app1 = ApplicationCreate(
        resume_version_id=created_version1.id,
        company="TechCorp Inc.",
        position="Senior Software Engineer",
        application_date=date(2024, 1, 15),
        status="interview",
        notes="Phone interview scheduled for next week",
        follow_up_date=date(2024, 1, 25)
    )
    db.create_application(app1)
    
    app2 = ApplicationCreate(
        resume_version_id=created_version2.id,
        company="StartupXYZ",
        position="Full Stack Developer",
        application_date=date(2024, 1, 10),
        status="applied",
        notes="Waiting for response"
    )
    db.create_application(app2)
    
    print("✓ Applications created")
    
    # Create backup
    backup_path = "resume_editor_backup.json"
    if migration.create_backup(user_id, backup_path):
        print(f"✓ Backup created: {backup_path}")
    
    print("\n🎉 Database initialization complete!")
    print(f"Database file: resume_editor.db")
    print(f"Backup file: {backup_path}")
    print(f"Sample user ID: {user_id}")
    
    # Display summary
    print("\n📊 Database Summary:")
    personal_info = db.get_personal_info(user_id)
    education = db.get_education(user_id)
    certifications = db.get_certifications(user_id)
    resume_versions = db.get_resume_versions(user_id)
    applications = db.get_applications(user_id)
    
    print(f"  Personal Info: {personal_info.full_name if personal_info else 'None'}")
    print(f"  Education Entries: {len(education)}")
    print(f"  Certifications: {len(certifications)}")
    print(f"  Resume Versions: {len(resume_versions)}")
    print(f"  Applications: {len(applications)}")
    
    return db


if __name__ == "__main__":
    init_database()
