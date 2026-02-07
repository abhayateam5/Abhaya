-- ============================================================================
-- Migration: Create Test User Profile for Test Pages
-- Description: Creates a test user profile for unauthenticated test pages
-- ============================================================================

-- Insert test user profile with correct column names
INSERT INTO profiles (id, name, email, phone, created_at, updated_at)
VALUES 
  ('d74a4a73-7938-43c6-b54f-98b604579972', 'Test User', 'testuser@abhaya.com', '+919876543210', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- Allow reading test user profile (for test pages without authentication)
DROP POLICY IF EXISTS "allow_read_test_user_profile" ON profiles;
CREATE POLICY "allow_read_test_user_profile" ON profiles
    FOR SELECT
    USING (id = 'd74a4a73-7938-43c6-b54f-98b604579972');
