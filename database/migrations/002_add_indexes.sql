-- Migration: 002_add_indexes.sql
-- Description: Add indexes for better performance
-- Created: 2024-01-15
-- Author: Resume Editor Team

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personal_info_user_id ON personal_info(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON resume_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_company ON resume_versions(company_name);
CREATE INDEX IF NOT EXISTS idx_resume_history_version_id ON resume_history(resume_version_id);
CREATE INDEX IF NOT EXISTS idx_applications_version_id ON applications(resume_version_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_templates_industry ON templates(industry);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);
