-- Migration: 006_add_hashed_password_to_users.sql
-- Description: Add hashed_password to users table for authentication
-- Created: 2025-12-11
-- Author: Gemini

ALTER TABLE users ADD COLUMN hashed_password TEXT NOT NULL DEFAULT 'NOT_A_VALID_PASSWORD';