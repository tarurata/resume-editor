-- Migration: 009_remove_full_name_from_users.sql
-- Description: Remove full_name from users table
-- Created: 2024-01-15

CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users_new (id, email, hashed_password, is_active, created_at, updated_at)
SELECT id, email, hashed_password, is_active, created_at, updated_at
FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;
