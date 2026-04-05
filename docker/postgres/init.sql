-- University LMS Database Initialization
-- This script runs once when postgres container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Database is created by environment variables
-- Ensure university_lms database exists
