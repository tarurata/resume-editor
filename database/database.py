"""
Database service layer for Resume Editor
SQLite database operations
"""

import sqlite3
import json
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pathlib import Path

from .models import (
    PersonalInfo, Education, Certification, ResumeVersion, ResumeHistory,
    Application, Template, ResumeVersionCreate, ResumeVersionUpdate,
    ApplicationCreate, ApplicationUpdate, ExtendedResume,
    Experience, Achievement, ExperienceCreate, ExperienceUpdate,
    AchievementCreate, AchievementUpdate
)


class DatabaseService:
    """SQLite database service for Resume Editor"""
    
    def __init__(self, db_path: str = "resume_editor.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database with schema"""
        schema_path = Path(__file__).parent / "schema.sql"
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript(schema_sql)
            conn.commit()
    
    def get_connection(self):
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    # Personal Info operations
    def create_personal_info(self, personal_info: PersonalInfo) -> PersonalInfo:
        """Create personal information"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            personal_info.id = str(uuid.uuid4())
            personal_info.created_at = datetime.now()
            personal_info.updated_at = datetime.now()
            
            cursor.execute("""
                INSERT INTO personal_info (id, user_id, full_name, email, phone, location, linkedin_url, portfolio_url, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                personal_info.id, personal_info.user_id, personal_info.full_name,
                personal_info.email, personal_info.phone, personal_info.location,
                personal_info.linkedin_url, personal_info.portfolio_url,
                personal_info.created_at, personal_info.updated_at
            ))
            conn.commit()
            return personal_info
    
    def get_personal_info(self, user_id: str) -> Optional[PersonalInfo]:
        """Get personal information by user ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM personal_info WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return PersonalInfo(**dict(row))
            return None
    
    def update_personal_info(self, personal_info: PersonalInfo) -> PersonalInfo:
        """Update personal information"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            personal_info.updated_at = datetime.now()
            
            cursor.execute("""
                UPDATE personal_info 
                SET full_name = ?, email = ?, phone = ?, location = ?, 
                    linkedin_url = ?, portfolio_url = ?, updated_at = ?
                WHERE id = ?
            """, (
                personal_info.full_name, personal_info.email, personal_info.phone,
                personal_info.location, personal_info.linkedin_url, personal_info.portfolio_url,
                personal_info.updated_at, personal_info.id
            ))
            conn.commit()
            return personal_info
    
    def delete_personal_info(self, user_id: str) -> bool:
        """Delete personal information"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM personal_info WHERE user_id = ?", (user_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    # Education operations
    def create_education(self, education: Education) -> Education:
        """Create education entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            education.id = str(uuid.uuid4())
            education.created_at = datetime.now()
            education.updated_at = datetime.now()
            
            cursor.execute("""
                INSERT INTO education (id, user_id, degree, institution, field_of_study, 
                                    graduation_date, gpa, location, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                education.id, education.user_id, education.degree, education.institution,
                education.field_of_study, education.graduation_date, education.gpa,
                education.location, education.created_at, education.updated_at
            ))
            conn.commit()
            return education
    
    def get_education(self, user_id: str) -> List[Education]:
        """Get all education entries for user"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM education WHERE user_id = ? ORDER BY graduation_date DESC", (user_id,))
            rows = cursor.fetchall()
            return [Education(**dict(row)) for row in rows]
    
    def update_education(self, education: Education) -> Education:
        """Update education entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            education.updated_at = datetime.now()
            
            cursor.execute("""
                UPDATE education 
                SET degree = ?, institution = ?, field_of_study = ?, graduation_date = ?,
                    gpa = ?, location = ?, updated_at = ?
                WHERE id = ?
            """, (
                education.degree, education.institution, education.field_of_study,
                education.graduation_date, education.gpa, education.location,
                education.updated_at, education.id
            ))
            conn.commit()
            return education
    
    def delete_education(self, education_id: str) -> bool:
        """Delete education entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM education WHERE id = ?", (education_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    # Certification operations
    def create_certification(self, certification: Certification) -> Certification:
        """Create certification entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            certification.id = str(uuid.uuid4())
            certification.created_at = datetime.now()
            certification.updated_at = datetime.now()
            
            cursor.execute("""
                INSERT INTO certifications (id, user_id, name, issuer, issue_date, 
                                         expiry_date, credential_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                certification.id, certification.user_id, certification.name,
                certification.issuer, certification.issue_date, certification.expiry_date,
                certification.credential_id, certification.created_at, certification.updated_at
            ))
            conn.commit()
            return certification
    
    def get_certifications(self, user_id: str) -> List[Certification]:
        """Get all certifications for user"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM certifications WHERE user_id = ? ORDER BY issue_date DESC", (user_id,))
            rows = cursor.fetchall()
            return [Certification(**dict(row)) for row in rows]
    
    def update_certification(self, certification: Certification) -> Certification:
        """Update certification entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            certification.updated_at = datetime.now()
            
            cursor.execute("""
                UPDATE certifications 
                SET name = ?, issuer = ?, issue_date = ?, expiry_date = ?,
                    credential_id = ?, updated_at = ?
                WHERE id = ?
            """, (
                certification.name, certification.issuer, certification.issue_date,
                certification.expiry_date, certification.credential_id,
                certification.updated_at, certification.id
            ))
            conn.commit()
            return certification
    
    def delete_certification(self, certification_id: str) -> bool:
        """Delete certification entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM certifications WHERE id = ?", (certification_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def get_education_by_id(self, education_id: str) -> Optional[Education]:
        """Get education entry by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM education WHERE id = ?", (education_id,))
            row = cursor.fetchone()
            if row:
                return Education(**dict(row))
            return None
    
    def get_certification_by_id(self, certification_id: str) -> Optional[Certification]:
        """Get certification by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM certifications WHERE id = ?", (certification_id,))
            row = cursor.fetchone()
            if row:
                return Certification(**dict(row))
            return None
    
    # Resume Version operations
    def create_resume_version(self, resume_version: ResumeVersionCreate, user_id: str) -> ResumeVersion:
        """Create a new resume version"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            version_id = str(uuid.uuid4())
            now = datetime.now()
            
            cursor.execute("""
                INSERT INTO resume_versions (id, user_id, company_name, company_email, 
                                          job_title, job_description, resume_data, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                version_id, user_id, resume_version.company_name, resume_version.company_email,
                resume_version.job_title, resume_version.job_description,
                json.dumps(resume_version.resume_data), False, now, now
            ))
            conn.commit()
            
            return ResumeVersion(
                id=version_id, user_id=user_id, company_name=resume_version.company_name,
                company_email=resume_version.company_email, job_title=resume_version.job_title,
                job_description=resume_version.job_description, resume_data=resume_version.resume_data,
                is_active=False, created_at=now, updated_at=now
            )
    
    def get_resume_versions(self, user_id: str) -> List[ResumeVersion]:
        """Get all resume versions for user"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM resume_versions WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            rows = cursor.fetchall()
            versions = []
            for row in rows:
                data = dict(row)
                data['resume_data'] = json.loads(data['resume_data'])
                versions.append(ResumeVersion(**data))
            return versions
    
    def get_resume_version(self, version_id: str) -> Optional[ResumeVersion]:
        """Get specific resume version"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM resume_versions WHERE id = ?", (version_id,))
            row = cursor.fetchone()
            if row:
                data = dict(row)
                data['resume_data'] = json.loads(data['resume_data'])
                return ResumeVersion(**data)
            return None
    
    def update_resume_version(self, version_id: str, update_data: ResumeVersionUpdate) -> Optional[ResumeVersion]:
        """Update resume version"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            if update_data.company_name is not None:
                update_fields.append("company_name = ?")
                values.append(update_data.company_name)
            
            if update_data.company_email is not None:
                update_fields.append("company_email = ?")
                values.append(update_data.company_email)
            
            if update_data.job_title is not None:
                update_fields.append("job_title = ?")
                values.append(update_data.job_title)
            
            if update_data.job_description is not None:
                update_fields.append("job_description = ?")
                values.append(update_data.job_description)
            
            if update_data.resume_data is not None:
                update_fields.append("resume_data = ?")
                values.append(json.dumps(update_data.resume_data))
            
            if update_data.is_active is not None:
                update_fields.append("is_active = ?")
                values.append(update_data.is_active)
            
            if not update_fields:
                return self.get_resume_version(version_id)
            
            update_fields.append("updated_at = ?")
            values.append(datetime.now())
            values.append(version_id)
            
            query = f"UPDATE resume_versions SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, values)
            conn.commit()
            
            return self.get_resume_version(version_id)
    
    def delete_resume_version(self, version_id: str) -> bool:
        """Delete resume version"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM resume_versions WHERE id = ?", (version_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def set_active_resume_version(self, version_id: str, user_id: str) -> bool:
        """Set a resume version as active (deactivate others)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Deactivate all versions for user
            cursor.execute("UPDATE resume_versions SET is_active = 0 WHERE user_id = ?", (user_id,))
            
            # Activate specific version
            cursor.execute("UPDATE resume_versions SET is_active = 1 WHERE id = ? AND user_id = ?", 
                         (version_id, user_id))
            conn.commit()
            return cursor.rowcount > 0
    
    # Application operations
    def create_application(self, application: ApplicationCreate) -> Application:
        """Create application tracking entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            app_id = str(uuid.uuid4())
            now = datetime.now()
            
            cursor.execute("""
                INSERT INTO applications (id, resume_version_id, company, position, 
                                       application_date, status, notes, follow_up_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                app_id, application.resume_version_id, application.company,
                application.position, application.application_date, application.status,
                application.notes, application.follow_up_date, now, now
            ))
            conn.commit()
            
            return Application(
                id=app_id, resume_version_id=application.resume_version_id,
                company=application.company, position=application.position,
                application_date=application.application_date, status=application.status,
                notes=application.notes, follow_up_date=application.follow_up_date,
                created_at=now, updated_at=now
            )
    
    def get_applications(self, user_id: str) -> List[Application]:
        """Get all applications for user"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT a.* FROM applications a
                JOIN resume_versions rv ON a.resume_version_id = rv.id
                WHERE rv.user_id = ?
                ORDER BY a.application_date DESC
            """, (user_id,))
            rows = cursor.fetchall()
            return [Application(**dict(row)) for row in rows]
    
    def update_application(self, application_id: str, update_data: ApplicationUpdate) -> Optional[Application]:
        """Update application"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            if update_data.company is not None:
                update_fields.append("company = ?")
                values.append(update_data.company)
            
            if update_data.position is not None:
                update_fields.append("position = ?")
                values.append(update_data.position)
            
            if update_data.application_date is not None:
                update_fields.append("application_date = ?")
                values.append(update_data.application_date)
            
            if update_data.status is not None:
                update_fields.append("status = ?")
                values.append(update_data.status)
            
            if update_data.notes is not None:
                update_fields.append("notes = ?")
                values.append(update_data.notes)
            
            if update_data.follow_up_date is not None:
                update_fields.append("follow_up_date = ?")
                values.append(update_data.follow_up_date)
            
            if not update_fields:
                return self.get_application(application_id)
            
            update_fields.append("updated_at = ?")
            values.append(datetime.now())
            values.append(application_id)
            
            query = f"UPDATE applications SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, values)
            conn.commit()
            
            return self.get_application(application_id)
    
    def get_application(self, application_id: str) -> Optional[Application]:
        """Get specific application"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM applications WHERE id = ?", (application_id,))
            row = cursor.fetchone()
            if row:
                return Application(**dict(row))
            return None
    
    def delete_application(self, application_id: str) -> bool:
        """Delete application"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM applications WHERE id = ?", (application_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    # Resume History operations
    def add_resume_history(self, resume_version_id: str, change_type: str, 
                          section_changed: str, old_value: Optional[dict] = None,
                          new_value: Optional[dict] = None, change_reason: Optional[str] = None):
        """Add entry to resume history"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            history_id = str(uuid.uuid4())
            now = datetime.now()
            
            cursor.execute("""
                INSERT INTO resume_history (id, resume_version_id, change_type, section_changed,
                                         old_value, new_value, change_reason, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                history_id, resume_version_id, change_type, section_changed,
                json.dumps(old_value) if old_value else None,
                json.dumps(new_value) if new_value else None,
                change_reason, now
            ))
            conn.commit()
    
    def get_resume_history(self, resume_version_id: str) -> List[ResumeHistory]:
        """Get resume history for a version"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM resume_history 
                WHERE resume_version_id = ? 
                ORDER BY created_at DESC
            """, (resume_version_id,))
            rows = cursor.fetchall()
            history = []
            for row in rows:
                data = dict(row)
                data['old_value'] = json.loads(data['old_value']) if data['old_value'] else None
                data['new_value'] = json.loads(data['new_value']) if data['new_value'] else None
                history.append(ResumeHistory(**data))
            return history

    # Experience operations
    def create_experience(self, experience: ExperienceCreate) -> Experience:
        """Create a new experience entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            experience_id = str(uuid.uuid4())
            now = datetime.now()
            
            cursor.execute("""
                INSERT INTO experiences (id, resume_version_id, role, organization, 
                                      location, start_date, end_date, order_index, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                experience_id, experience.resume_version_id, experience.role,
                experience.organization, experience.location, experience.start_date,
                experience.end_date, experience.order_index, now, now
            ))
            conn.commit()
            
            return Experience(
                id=experience_id, resume_version_id=experience.resume_version_id,
                role=experience.role, organization=experience.organization,
                location=experience.location, start_date=experience.start_date,
                end_date=experience.end_date, order_index=experience.order_index,
                created_at=now, updated_at=now
            )

    def get_experiences(self, resume_version_id: str) -> List[Experience]:
        """Get all experiences for a resume version"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM experiences 
                WHERE resume_version_id = ? 
                ORDER BY order_index ASC, created_at ASC
            """, (resume_version_id,))
            rows = cursor.fetchall()
            return [Experience(**dict(row)) for row in rows]

    def get_experience(self, experience_id: str) -> Optional[Experience]:
        """Get specific experience by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM experiences WHERE id = ?", (experience_id,))
            row = cursor.fetchone()
            if row:
                return Experience(**dict(row))
            return None

    def update_experience(self, experience_id: str, update_data: ExperienceUpdate) -> Optional[Experience]:
        """Update experience entry"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            if update_data.role is not None:
                update_fields.append("role = ?")
                values.append(update_data.role)
            
            if update_data.organization is not None:
                update_fields.append("organization = ?")
                values.append(update_data.organization)
            
            if update_data.location is not None:
                update_fields.append("location = ?")
                values.append(update_data.location)
            
            if update_data.start_date is not None:
                update_fields.append("start_date = ?")
                values.append(update_data.start_date)
            
            if update_data.end_date is not None:
                update_fields.append("end_date = ?")
                values.append(update_data.end_date)
            
            if update_data.order_index is not None:
                update_fields.append("order_index = ?")
                values.append(update_data.order_index)
            
            if not update_fields:
                return self.get_experience(experience_id)
            
            update_fields.append("updated_at = ?")
            values.append(datetime.now())
            values.append(experience_id)
            
            query = f"UPDATE experiences SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, values)
            conn.commit()
            
            return self.get_experience(experience_id)

    def delete_experience(self, experience_id: str) -> bool:
        """Delete experience entry and all its achievements"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete all achievements first (CASCADE should handle this, but being explicit)
            cursor.execute("DELETE FROM achievements WHERE experience_id = ?", (experience_id,))
            
            # Delete the experience
            cursor.execute("DELETE FROM experiences WHERE id = ?", (experience_id,))
            conn.commit()
            return cursor.rowcount > 0

    # Achievement operations
    def create_achievement(self, achievement: AchievementCreate) -> Achievement:
        """Create a new achievement"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            achievement_id = str(uuid.uuid4())
            now = datetime.now()
            
            cursor.execute("""
                INSERT INTO achievements (id, experience_id, achievement_text, order_index, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                achievement_id, achievement.experience_id, achievement.achievement_text,
                achievement.order_index, now, now
            ))
            conn.commit()
            
            return Achievement(
                id=achievement_id, experience_id=achievement.experience_id,
                achievement_text=achievement.achievement_text, order_index=achievement.order_index,
                created_at=now, updated_at=now
            )

    def get_achievements(self, experience_id: str) -> List[Achievement]:
        """Get all achievements for an experience"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM achievements 
                WHERE experience_id = ? 
                ORDER BY order_index ASC, created_at ASC
            """, (experience_id,))
            rows = cursor.fetchall()
            return [Achievement(**dict(row)) for row in rows]

    def get_achievement(self, achievement_id: str) -> Optional[Achievement]:
        """Get specific achievement by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM achievements WHERE id = ?", (achievement_id,))
            row = cursor.fetchone()
            if row:
                return Achievement(**dict(row))
            return None

    def update_achievement(self, achievement_id: str, update_data: AchievementUpdate) -> Optional[Achievement]:
        """Update achievement"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            if update_data.achievement_text is not None:
                update_fields.append("achievement_text = ?")
                values.append(update_data.achievement_text)
            
            if update_data.order_index is not None:
                update_fields.append("order_index = ?")
                values.append(update_data.order_index)
            
            if not update_fields:
                return self.get_achievement(achievement_id)
            
            update_fields.append("updated_at = ?")
            values.append(datetime.now())
            values.append(achievement_id)
            
            query = f"UPDATE achievements SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, values)
            conn.commit()
            
            return self.get_achievement(achievement_id)

    def delete_achievement(self, achievement_id: str) -> bool:
        """Delete achievement"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM achievements WHERE id = ?", (achievement_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_experiences_with_achievements(self, resume_version_id: str) -> List[Dict[str, Any]]:
        """Get experiences with their achievements for a resume version"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT e.*, a.id as achievement_id, a.achievement_text, a.order_index as achievement_order
                FROM experiences e
                LEFT JOIN achievements a ON e.id = a.experience_id
                WHERE e.resume_version_id = ?
                ORDER BY e.order_index ASC, e.created_at ASC, a.order_index ASC, a.created_at ASC
            """, (resume_version_id,))
            rows = cursor.fetchall()
            
            # Group experiences with their achievements
            experiences = {}
            for row in rows:
                exp_id = row['id']
                if exp_id not in experiences:
                    experiences[exp_id] = {
                        'id': row['id'],
                        'resume_version_id': row['resume_version_id'],
                        'role': row['role'],
                        'organization': row['organization'],
                        'location': row['location'],
                        'start_date': row['start_date'],
                        'end_date': row['end_date'],
                        'order_index': row['order_index'],
                        'created_at': row['created_at'],
                        'updated_at': row['updated_at'],
                        'achievements': []
                    }
                
                if row['achievement_id']:
                    experiences[exp_id]['achievements'].append({
                        'id': row['achievement_id'],
                        'achievement_text': row['achievement_text'],
                        'order_index': row['achievement_order']
                    })
            
            return list(experiences.values())


# FastAPI dependency for database access
def get_db():
    """FastAPI dependency to get database service instance"""
    return DatabaseService()
