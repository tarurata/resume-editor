-- Seed: 002_resume_templates.sql
-- Description: Sample resume templates
-- Created: 2024-01-15

-- Insert sample templates
INSERT OR IGNORE INTO templates (id, name, description, industry, template_data, is_public, created_by) VALUES 
('template_001', 'ATS Clean', 'Clean, ATS-friendly resume template', 'Technology', '{"title": "Software Engineer", "summary": "Experienced software engineer with expertise in...", "experience": [], "skills": []}', 1, 'sample_user'),
('template_002', 'Compact', 'Compact resume template for experienced professionals', 'General', '{"title": "Senior Professional", "summary": "Senior professional with extensive experience...", "experience": [], "skills": []}', 1, 'sample_user');
