-- Initialize database with required schemas and extensions

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS chat;
CREATE SCHEMA IF NOT EXISTS knowledge;
CREATE SCHEMA IF NOT EXISTS profiles;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pgvector extension
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "pgvector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available, will install manually';
END$$;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For BM25 text search

-- Grant permissions
GRANT ALL ON SCHEMA auth TO localrag;
GRANT ALL ON SCHEMA chat TO localrag;
GRANT ALL ON SCHEMA knowledge TO localrag;
GRANT ALL ON SCHEMA profiles TO localrag;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully';
END $$;
