-- Add company_url field to resume_versions table
-- This field will store the job posting URL for the company

ALTER TABLE resume_versions ADD COLUMN company_url TEXT;

-- Add index for company_url for better query performance
CREATE INDEX IF NOT EXISTS idx_resume_versions_company_url ON resume_versions(company_url);
