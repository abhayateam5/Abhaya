-- Add RLS Policies for Phase 6 Tables
-- Tables panic_words and check_ins were created in 005_family_tracking_enhancements.sql
-- but missing RLS policies, causing "permission denied" errors

-- ============================================================================
-- ENABLE RLS ON PHASE 6 TABLES
-- ============================================================================

ALTER TABLE panic_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PANIC_WORDS POLICIES
-- ============================================================================

-- Users can manage their own panic words
CREATE POLICY "users_manage_own_panic_words" ON panic_words
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Police can view all panic words (for verification during SOS)
CREATE POLICY "police_view_all_panic_words" ON panic_words
    FOR SELECT
    USING (is_police());

-- ============================================================================
-- CHECK_INS POLICIES
-- ============================================================================

-- Users can view their own check-ins
CREATE POLICY "users_view_own_check_ins" ON check_ins
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own check-ins
CREATE POLICY "users_create_own_check_ins" ON check_ins
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Parents can view their children's check-ins
CREATE POLICY "parents_view_children_check_ins" ON check_ins
    FOR SELECT
    USING (
        user_id IN (
            SELECT child_id FROM family_links
            WHERE parent_id = auth.uid()
            AND status = 'active'
        )
    );

-- Children can view their parents' check-ins
CREATE POLICY "children_view_parents_check_ins" ON check_ins
    FOR SELECT
    USING (
        user_id IN (
            SELECT parent_id FROM family_links
            WHERE child_id = auth.uid()
            AND status = 'active'
        )
    );

-- Police can view all check-ins
CREATE POLICY "police_view_all_check_ins" ON check_ins
    FOR SELECT
    USING (is_police());

-- ============================================================================
-- FAMILY_LINKS ADDITIONAL POLICIES FOR PHASE 6
-- ============================================================================

-- Users can update family links they're part of (for consent management)
CREATE POLICY "users_update_family_consent" ON family_links
    FOR UPDATE
    USING (parent_id = auth.uid() OR child_id = auth.uid())
    WITH CHECK (parent_id = auth.uid() OR child_id = auth.uid());

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- This migration adds the missing RLS policies for Phase 6 family tracking tables
