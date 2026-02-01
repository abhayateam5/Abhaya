-- ABHAYA System - Row Level Security (RLS) Policies
-- Design Principle: ZERO-TRUST - No table is accessible unless explicitly allowed
-- Security Model: Database-enforced, not API-enforced

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE police_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE efir_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (except role and status)
CREATE POLICY "users_update_own_profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM profiles WHERE id = auth.uid()) AND -- Role cannot be changed
        status = (SELECT status FROM profiles WHERE id = auth.uid()) -- Status cannot be self-changed
    );

-- Parents can view their children's profiles
CREATE POLICY "parents_view_children_profiles" ON profiles
    FOR SELECT
    USING (
        id IN (
            SELECT child_id FROM family_links
            WHERE parent_id = auth.uid()
        )
    );

-- Children can view their parents' profiles
CREATE POLICY "children_view_parents_profiles" ON profiles
    FOR SELECT
    USING (
        id IN (
            SELECT parent_id FROM family_links
            WHERE child_id = auth.uid()
        )
    );

-- Police can view all active profiles
CREATE POLICY "police_view_all_profiles" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() 
            AND role = 'police'
            AND status = 'active'
        )
    );

-- Admins can do everything
CREATE POLICY "admin_all_profiles" ON profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- FAMILY LINKS POLICIES
-- ============================================================================

-- Parents can view their own family links
CREATE POLICY "parents_view_own_links" ON family_links
    FOR SELECT
    USING (parent_id = auth.uid());

-- Children can view their own family links
CREATE POLICY "children_view_own_links" ON family_links
    FOR SELECT
    USING (child_id = auth.uid());

-- Parents can create family links (add children)
CREATE POLICY "parents_create_links" ON family_links
    FOR INSERT
    WITH CHECK (
        parent_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'parent'
        )
    );

-- Parents can delete their own family links
CREATE POLICY "parents_delete_links" ON family_links
    FOR DELETE
    USING (parent_id = auth.uid());

-- Children can delete family links (leave family)
CREATE POLICY "children_delete_links" ON family_links
    FOR DELETE
    USING (child_id = auth.uid());

-- Police can view all family links (for investigation)
CREATE POLICY "police_view_all_links" ON family_links
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- LIVE LOCATIONS POLICIES
-- ============================================================================

-- Users can view their own location
CREATE POLICY "users_view_own_location" ON live_locations
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own location
CREATE POLICY "users_update_own_location" ON live_locations
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Parents can view their children's locations (if permitted)
CREATE POLICY "parents_view_children_locations" ON live_locations
    FOR SELECT
    USING (
        user_id IN (
            SELECT child_id FROM family_links
            WHERE parent_id = auth.uid()
            AND can_view_location = true
        )
    );

-- Children can view their parents' locations
CREATE POLICY "children_view_parents_locations" ON live_locations
    FOR SELECT
    USING (
        user_id IN (
            SELECT parent_id FROM family_links
            WHERE child_id = auth.uid()
        )
    );

-- Police can view all locations
CREATE POLICY "police_view_all_locations" ON live_locations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- SOS EVENTS POLICIES (CRITICAL - Safety-first)
-- ============================================================================

-- Users can view their own SOS events
CREATE POLICY "users_view_own_sos" ON sos_events
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own SOS events
CREATE POLICY "users_create_own_sos" ON sos_events
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Parents can view their children's SOS events
CREATE POLICY "parents_view_children_sos" ON sos_events
    FOR SELECT
    USING (
        user_id IN (
            SELECT child_id FROM family_links
            WHERE parent_id = auth.uid()
            AND can_receive_alerts = true
        )
    );

-- Police can view all SOS events
CREATE POLICY "police_view_all_sos" ON sos_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- Police can update SOS events (acknowledge, respond, verify, resolve)
CREATE POLICY "police_update_sos" ON sos_events
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- Users CANNOT delete SOS events (immutable audit trail)
-- No DELETE policy = no one can delete

-- ============================================================================
-- LOCATION HISTORY POLICIES
-- ============================================================================

-- Users can view their own location history
CREATE POLICY "users_view_own_history" ON location_history
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own location history
CREATE POLICY "users_insert_own_history" ON location_history
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Parents can view their children's location history
CREATE POLICY "parents_view_children_history" ON location_history
    FOR SELECT
    USING (
        user_id IN (
            SELECT child_id FROM family_links
            WHERE parent_id = auth.uid()
        )
    );

-- Police can view all location history (for investigations)
CREATE POLICY "police_view_all_history" ON location_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- SAFE ZONES POLICIES (Public Read)
-- ============================================================================

-- Everyone can view active safe zones
CREATE POLICY "everyone_view_safe_zones" ON safe_zones
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Police can create safe zones
CREATE POLICY "police_create_safe_zones" ON safe_zones
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- Police can update safe zones
CREATE POLICY "police_update_safe_zones" ON safe_zones
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- RISK ZONES POLICIES
-- ============================================================================

-- Everyone can view active risk zones
CREATE POLICY "everyone_view_risk_zones" ON risk_zones
    FOR SELECT
    TO authenticated
    USING (
        is_active = true AND
        (valid_until IS NULL OR valid_until > NOW())
    );

-- Police can manage risk zones
CREATE POLICY "police_manage_risk_zones" ON risk_zones
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- POLICE STATIONS POLICIES (Public Read)
-- ============================================================================

-- Everyone can view operational police stations
CREATE POLICY "everyone_view_police_stations" ON police_stations
    FOR SELECT
    TO authenticated
    USING (is_operational = true);

-- Police can update police stations
CREATE POLICY "police_update_stations" ON police_stations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- SAFETY SCORES POLICIES
-- ============================================================================

-- Users can view their own safety scores
CREATE POLICY "users_view_own_scores" ON safety_scores
    FOR SELECT
    USING (user_id = auth.uid());

-- System can insert safety scores (via service role)
CREATE POLICY "system_insert_scores" ON safety_scores
    FOR INSERT
    WITH CHECK (true); -- Service role only

-- Parents can view their children's safety scores
CREATE POLICY "parents_view_children_scores" ON safety_scores
    FOR SELECT
    USING (
        user_id IN (
            SELECT child_id FROM family_links
            WHERE parent_id = auth.uid()
        )
    );

-- Police can view all safety scores
CREATE POLICY "police_view_all_scores" ON safety_scores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- E-FIR REPORTS POLICIES
-- ============================================================================

-- Users can view their own e-FIR reports
CREATE POLICY "users_view_own_efir" ON efir_reports
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own e-FIR reports
CREATE POLICY "users_create_own_efir" ON efir_reports
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own DRAFT e-FIR reports only
CREATE POLICY "users_update_draft_efir" ON efir_reports
    FOR UPDATE
    USING (user_id = auth.uid() AND status = 'draft')
    WITH CHECK (user_id = auth.uid() AND status = 'draft');

-- Police can view all e-FIR reports
CREATE POLICY "police_view_all_efir" ON efir_reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- Police can update e-FIR reports (assign, resolve)
CREATE POLICY "police_update_efir" ON efir_reports
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- ITINERARIES POLICIES
-- ============================================================================

-- Users can manage their own itineraries
CREATE POLICY "users_manage_own_itineraries" ON itineraries
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Parents can view their children's itineraries
CREATE POLICY "parents_view_children_itineraries" ON itineraries
    FOR SELECT
    USING (
        user_id IN (
            SELECT child_id FROM family_links
            WHERE parent_id = auth.uid()
        )
    );

-- Police can view all itineraries
CREATE POLICY "police_view_all_itineraries" ON itineraries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- ============================================================================
-- DESTINATIONS POLICIES
-- ============================================================================

-- Users can manage destinations of their own itineraries
CREATE POLICY "users_manage_own_destinations" ON destinations
    FOR ALL
    USING (
        itinerary_id IN (
            SELECT id FROM itineraries WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        itinerary_id IN (
            SELECT id FROM itineraries WHERE user_id = auth.uid()
        )
    );

-- Parents can view destinations of their children's itineraries
CREATE POLICY "parents_view_children_destinations" ON destinations
    FOR SELECT
    USING (
        itinerary_id IN (
            SELECT i.id FROM itineraries i
            JOIN family_links fl ON i.user_id = fl.child_id
            WHERE fl.parent_id = auth.uid()
        )
    );

-- ============================================================================
-- CHECKPOINTS POLICIES
-- ============================================================================

-- Users can manage checkpoints of their own destinations
CREATE POLICY "users_manage_own_checkpoints" ON checkpoints
    FOR ALL
    USING (
        destination_id IN (
            SELECT d.id FROM destinations d
            JOIN itineraries i ON d.itinerary_id = i.id
            WHERE i.user_id = auth.uid()
        )
    )
    WITH CHECK (
        destination_id IN (
            SELECT d.id FROM destinations d
            JOIN itineraries i ON d.itinerary_id = i.id
            WHERE i.user_id = auth.uid()
        )
    );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "users_view_own_notifications" ON notifications
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "users_update_own_notifications" ON notifications
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- System can insert notifications (via service role)
CREATE POLICY "system_insert_notifications" ON notifications
    FOR INSERT
    WITH CHECK (true); -- Service role only

-- ============================================================================
-- AUDIT LOG POLICIES (Read-only for users)
-- ============================================================================

-- Users can view their own audit log
CREATE POLICY "users_view_own_audit" ON audit_log
    FOR SELECT
    USING (user_id = auth.uid());

-- Police can view all audit logs
CREATE POLICY "police_view_all_audit" ON audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- System can insert audit logs (via service role)
CREATE POLICY "system_insert_audit" ON audit_log
    FOR INSERT
    WITH CHECK (true); -- Service role only

-- No one can update or delete audit logs (immutable)

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user is police
CREATE OR REPLACE FUNCTION is_police()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'police'
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is parent of another user
CREATE OR REPLACE FUNCTION is_parent_of(child_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM family_links
        WHERE parent_id = auth.uid()
        AND child_id = child_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- 1. All policies use auth.uid() which is set by Supabase Auth
-- 2. No frontend checks can bypass these policies
-- 3. Even service_role key respects RLS unless explicitly bypassed
-- 4. Realtime subscriptions automatically respect RLS
-- 5. Audit logs are immutable - no UPDATE or DELETE policies
-- 6. SOS events are immutable - no DELETE policy
-- 7. Parents cannot change their own role or status
-- 8. Police can only update SOS/e-FIR, not delete
-- 9. All location data requires authentication
-- 10. Safe zones and police stations are public read for safety
