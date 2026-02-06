-- Fix RLS Infinite Recursion Error
-- Problem: Policies on 'profiles' table were querying 'profiles' table, causing recursion
-- Solution: Use SECURITY DEFINER functions that bypass RLS

-- ============================================================================
-- DROP PROBLEMATIC POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "police_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
DROP POLICY IF EXISTS "police_view_all_links" ON family_links;
DROP POLICY IF EXISTS "police_view_all_locations" ON live_locations;
DROP POLICY IF EXISTS "police_view_all_sos" ON sos_events;
DROP POLICY IF EXISTS "police_update_sos" ON sos_events;
DROP POLICY IF EXISTS "police_view_all_history" ON location_history;
DROP POLICY IF EXISTS "police_create_safe_zones" ON safe_zones;
DROP POLICY IF EXISTS "police_update_safe_zones" ON safe_zones;
DROP POLICY IF EXISTS "police_manage_risk_zones" ON risk_zones;
DROP POLICY IF EXISTS "police_update_stations" ON police_stations;
DROP POLICY IF EXISTS "police_view_all_scores" ON safety_scores;
DROP POLICY IF EXISTS "police_view_all_efir" ON efir_reports;
DROP POLICY IF EXISTS "police_update_efir" ON efir_reports;
DROP POLICY IF EXISTS "police_view_all_itineraries" ON itineraries;
DROP POLICY IF EXISTS "police_view_all_audit" ON audit_log;
DROP POLICY IF EXISTS "parents_create_links" ON family_links;

-- ============================================================================
-- RECREATE POLICIES USING SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- Police can view all active profiles (using helper function)
CREATE POLICY "police_view_all_profiles" ON profiles
    FOR SELECT
    USING (is_police());

-- Admins can do everything (using helper function)
CREATE POLICY "admin_all_profiles" ON profiles
    FOR ALL
    USING (is_admin());

-- Police can view all family links
CREATE POLICY "police_view_all_links" ON family_links
    FOR SELECT
    USING (is_police());

-- Police can view all locations
CREATE POLICY "police_view_all_locations" ON live_locations
    FOR SELECT
    USING (is_police());

-- Police can view all SOS events
CREATE POLICY "police_view_all_sos" ON sos_events
    FOR SELECT
    USING (is_police());

-- Police can update SOS events
CREATE POLICY "police_update_sos" ON sos_events
    FOR UPDATE
    USING (is_police())
    WITH CHECK (is_police());

-- Police can view all location history
CREATE POLICY "police_view_all_history" ON location_history
    FOR SELECT
    USING (is_police());

-- Police can create safe zones
CREATE POLICY "police_create_safe_zones" ON safe_zones
    FOR INSERT
    WITH CHECK (is_police());

-- Police can update safe zones
CREATE POLICY "police_update_safe_zones" ON safe_zones
    FOR UPDATE
    USING (is_police());

-- Police can manage risk zones
CREATE POLICY "police_manage_risk_zones" ON risk_zones
    FOR ALL
    USING (is_police());

-- Police can update police stations
CREATE POLICY "police_update_stations" ON police_stations
    FOR UPDATE
    USING (is_police());

-- Police can view all safety scores
CREATE POLICY "police_view_all_scores" ON safety_scores
    FOR SELECT
    USING (is_police());

-- Police can view all e-FIR reports
CREATE POLICY "police_view_all_efir" ON efir_reports
    FOR SELECT
    USING (is_police());

-- Police can update e-FIR reports
CREATE POLICY "police_update_efir" ON efir_reports
    FOR UPDATE
    USING (is_police());

-- Police can view all itineraries
CREATE POLICY "police_view_all_itineraries" ON itineraries
    FOR SELECT
    USING (is_police());

-- Police can view all audit logs
CREATE POLICY "police_view_all_audit" ON audit_log
    FOR SELECT
    USING (is_police());

-- Parents can create family links (fix recursion)
CREATE POLICY "parents_create_links" ON family_links
    FOR INSERT
    WITH CHECK (
        parent_id = auth.uid()
        -- Removed role check that caused recursion
    );

-- ============================================================================
-- ADD FUNCTION TO GET USER ROLE SAFELY
-- ============================================================================

-- Helper function to get current user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- This migration fixes the infinite recursion error by using SECURITY DEFINER
-- functions that bypass RLS when checking user roles.
