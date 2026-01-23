-- Seed: 001_sample_data.sql
-- Description: Sample data for development and testing
-- Created: 2024-01-15

-- Insert sample user
INSERT OR IGNORE INTO users (id, email) VALUES 
('sample_user', 'john.doe@example.com');

-- Insert sample personal info
INSERT OR IGNORE INTO personal_info (id, user_id, full_name, email, phone, location, linkedin_url, portfolio_url) VALUES 
('personal_001', 'sample_user', 'John Doe', 'john.doe@example.com', '+1 (555) 123-4567', 'San Francisco, CA', 'https://linkedin.com/in/johndoe', 'https://johndoe.dev');

-- Insert sample education
INSERT OR IGNORE INTO education (id, user_id, degree, institution, field_of_study, graduation_date, gpa, location) VALUES 
('edu_001', 'sample_user', 'Bachelor of Science', 'University of California, Berkeley', 'Computer Science', '2018-05', 3.7, 'Berkeley, CA'),
('edu_002', 'sample_user', 'Master of Science', 'Stanford University', 'Software Engineering', '2020-06', 3.9, 'Stanford, CA');

-- Insert sample certifications
INSERT OR IGNORE INTO certifications (id, user_id, name, issuer, issue_date, expiry_date, credential_id) VALUES 
('cert_001', 'sample_user', 'AWS Certified Developer', 'Amazon Web Services', '2021-03', '2024-03', 'AWS-DEV-123456'),
('cert_002', 'sample_user', 'Google Cloud Professional Developer', 'Google Cloud', '2021-08', NULL, 'GCP-PROD-789012');
