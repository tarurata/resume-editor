-- Migration: 007_remove_hashed_password_default.sql
-- Description: Remove DEFAULT value from hashed_password column in users table (SQLite compatible)
-- Created: 2025-12-12
-- Author: Gemini

-- Start transaction
PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

-- Create a new table with the desired schema
CREATE TABLE users_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from the old table to the new table
INSERT INTO users_new (id, email, full_name, hashed_password, created_at, updated_at)
SELECT id, email, full_name, hashed_password, created_at, updated_at
FROM users;

-- Drop the old table
DROP TABLE users;

-- Rename the new table to the original table name
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes and triggers (if any were specifically on the users table)
-- In this case, triggers are on `update_users_updated_at` which needs to be recreated for the new table
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Recreate foreign key constraints that referenced the users table
-- These are handled by the schema.sql in general, but explicitly listing them for completeness
-- personal_info (user_id REFERENCES users(id))
-- education (user_id REFERENCES users(id))
-- certifications (user_id REFERENCES users(id))
-- resume_versions (user_id REFERENCES users(id))
-- templates (created_by REFERENCES users(id))

COMMIT;

PRAGMA foreign_keys=on;
