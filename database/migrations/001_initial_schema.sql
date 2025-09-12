-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Resume Editor
-- Created: 2024-01-15
-- Author: Resume Editor Team

-- Users table (for future M2 when authentication is added)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Personal information table
CREATE TABLE IF NOT EXISTS personal_info (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    graduation_date TEXT NOT NULL, -- YYYY-MM format
    gpa REAL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT NOT NULL, -- YYYY-MM format
    expiry_date TEXT, -- YYYY-MM format, nullable
    credential_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resume versions table (for multi-company management)
CREATE TABLE IF NOT EXISTS resume_versions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_email TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_description TEXT,
    resume_data TEXT NOT NULL, -- JSON string of resume data
    is_active BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resume history table (for tracking changes)
CREATE TABLE IF NOT EXISTS resume_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    resume_version_id TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
    section_changed TEXT NOT NULL,
    old_value TEXT, -- JSON string
    new_value TEXT, -- JSON string
    change_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_version_id) REFERENCES resume_versions(id) ON DELETE CASCADE
);

-- Applications tracking table
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    resume_version_id TEXT NOT NULL,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    application_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('applied', 'interview', 'rejected', 'offer', 'withdrawn')),
    notes TEXT,
    follow_up_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_version_id) REFERENCES resume_versions(id) ON DELETE CASCADE
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    template_data TEXT NOT NULL, -- JSON string
    is_public BOOLEAN DEFAULT 0,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
