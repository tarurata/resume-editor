-- Migration: 008_add_is_active_to_users.sql
-- Description: Add is_active column to users table
-- Created: 2024-01-15

ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;
