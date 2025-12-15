-- Migration script to remove department column from users table
ALTER TABLE users DROP COLUMN IF EXISTS department;