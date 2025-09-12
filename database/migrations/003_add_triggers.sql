-- Migration: 003_add_triggers.sql
-- Description: Add triggers for updating updated_at timestamps
-- Created: 2024-01-15
-- Author: Resume Editor Team

-- Triggers for updating updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_personal_info_updated_at 
    AFTER UPDATE ON personal_info
    BEGIN
        UPDATE personal_info SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_education_updated_at 
    AFTER UPDATE ON education
    BEGIN
        UPDATE education SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_certifications_updated_at 
    AFTER UPDATE ON certifications
    BEGIN
        UPDATE certifications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_resume_versions_updated_at 
    AFTER UPDATE ON resume_versions
    BEGIN
        UPDATE resume_versions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_applications_updated_at 
    AFTER UPDATE ON applications
    BEGIN
        UPDATE applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_templates_updated_at 
    AFTER UPDATE ON templates
    BEGIN
        UPDATE templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
