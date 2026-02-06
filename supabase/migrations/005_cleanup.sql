-- CLEANUP SCRIPT FOR PHASE 6 MIGRATION
-- Run this first if you get "already exists" errors
-- Then run the main migration again

-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS family_links_updated_at ON family_links;
DROP TRIGGER IF EXISTS panic_words_updated_at ON panic_words;

-- Drop policies
DROP POLICY IF EXISTS "users_manage_own_panic_word" ON panic_words;
DROP POLICY IF EXISTS "police_view_panic_words_during_sos" ON panic_words;
DROP POLICY IF EXISTS "users_create_own_check_ins" ON check_ins;
DROP POLICY IF EXISTS "users_view_own_check_ins" ON check_ins;
DROP POLICY IF EXISTS "family_view_check_ins" ON check_ins;
DROP POLICY IF EXISTS "police_view_all_check_ins" ON check_ins;

-- Drop tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS panic_words CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_invite_code();
DROP FUNCTION IF EXISTS expire_tracking_consent();
DROP FUNCTION IF EXISTS is_tracking_allowed(UUID, UUID);
DROP FUNCTION IF EXISTS update_family_links_updated_at();
DROP FUNCTION IF EXISTS update_panic_words_updated_at();

-- Drop indexes on family_links
DROP INDEX IF EXISTS idx_family_links_invite_code;
DROP INDEX IF EXISTS idx_family_links_consent;
DROP INDEX IF EXISTS idx_family_links_status;

-- Remove added columns from family_links
ALTER TABLE family_links 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS tracking_consent_until,
DROP COLUMN IF EXISTS emergency_override,
DROP COLUMN IF EXISTS delegation_type,
DROP COLUMN IF EXISTS last_check_in,
DROP COLUMN IF EXISTS invite_code,
DROP COLUMN IF EXISTS invite_expires_at,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS updated_at;

-- Done! Now you can run 005_family_tracking_enhancements.sql again
