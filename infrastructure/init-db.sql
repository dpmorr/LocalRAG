-- Initialize database with required schemas and extensions

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS chat;
CREATE SCHEMA IF NOT EXISTS knowledge;
CREATE SCHEMA IF NOT EXISTS profiles;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For BM25 text search

-- Grant permissions
GRANT ALL ON SCHEMA auth TO career_mentor;
GRANT ALL ON SCHEMA chat TO career_mentor;
GRANT ALL ON SCHEMA knowledge TO career_mentor;
GRANT ALL ON SCHEMA profiles TO career_mentor;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully';
END $$;
