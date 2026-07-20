process.env.NODE_ENV = 'test';
process.env.AUTH_DEV_BYPASS_ENABLED = 'true';
process.env.PRODAMUS_STUB_ENABLED = 'true';
process.env.SUPABASE_JWT_SECRET = 'dev-only-supabase-jwt-secret';
process.env.SUPABASE_JWT_ISSUER = 'tj-yoga-auth';
process.env.SUPABASE_JWT_AUDIENCE = 'authenticated';
