-- Migration 004: Add achievements table
-- This migration adds a dedicated table for storing key achievements

-- First, create the experiences table to reference achievements
CREATE TABLE IF NOT EXISTS experiences (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    resume_version_id TEXT NOT NULL,
    role TEXT NOT NULL,
    organization TEXT NOT NULL,
    location TEXT,
    start_date TEXT NOT NULL, -- YYYY-MM format
    end_date TEXT, -- YYYY-MM format or null for current
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_version_id) REFERENCES resume_versions(id) ON DELETE CASCADE
);

-- Create the achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    experience_id TEXT NOT NULL,
    achievement_text TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_experiences_resume_version_id ON experiences(resume_version_id);
CREATE INDEX IF NOT EXISTS idx_experiences_order ON experiences(order_index);
CREATE INDEX IF NOT EXISTS idx_achievements_experience_id ON achievements(experience_id);
CREATE INDEX IF NOT EXISTS idx_achievements_order ON achievements(order_index);

-- Create triggers for updating updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_experiences_updated_at 
    AFTER UPDATE ON experiences
    BEGIN
        UPDATE experiences SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_achievements_updated_at 
    AFTER UPDATE ON achievements
    BEGIN
        UPDATE achievements SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
