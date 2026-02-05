-- ABHAYA System - Events Table Migration
-- Phase 2: Event System
-- Purpose: Comprehensive event logging and audit trail for all system actions

-- ============================================================================
-- EVENTS TABLE (Audit Trail & Real-Time Event Source)
-- ============================================================================
-- Design: Immutable event log, source of truth for all system actions
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who triggered the event
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Event classification
    event_type TEXT NOT NULL CHECK (event_type IN (
        'SOS_TRIGGERED',
        'SOS_ACKNOWLEDGED',
        'SOS_RESOLVED',
        'ZONE_ENTERED',
        'ZONE_EXITED',
        'ANOMALY_DETECTED',
        'LOCATION_UPDATED',
        'CHECKPOINT_MISSED',
        'CHECKPOINT_REACHED',
        'FAMILY_LINK_CREATED',
        'FAMILY_LINK_REMOVED',
        'EFIR_SUBMITTED',
        'EFIR_UPDATED',
        'PROFILE_UPDATED',
        'ITINERARY_CREATED',
        'ITINERARY_UPDATED',
        'SAFETY_SCORE_CHANGED',
        'USER_ONLINE',
        'USER_OFFLINE'
    )),
    
    -- Severity for prioritization
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    
    -- Event metadata (flexible JSONB for event-specific data)
    event_data JSONB DEFAULT '{}'::jsonb,
    
    -- Location snapshot (if applicable)
    location GEOGRAPHY(POINT, 4326),
    
    -- Timestamps (immutable)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Query by user (most common)
CREATE INDEX idx_events_user_id ON events(user_id, created_at DESC);

-- Query by event type
CREATE INDEX idx_events_type ON events(event_type, created_at DESC);

-- Query by severity (for critical alerts)
CREATE INDEX idx_events_severity ON events(severity, created_at DESC) WHERE severity IN ('warning', 'critical');

-- Query by time range (for analytics)
CREATE INDEX idx_events_created ON events(created_at DESC);

-- Geospatial queries (events near location)
CREATE INDEX idx_events_location ON events USING GIST(location) WHERE location IS NOT NULL;

-- Composite index for filtered queries
CREATE INDEX idx_events_user_type_severity ON events(user_id, event_type, severity, created_at DESC);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view own events"
    ON events FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can create own events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Police can view all events (for monitoring)
CREATE POLICY "Police can view all events"
    ON events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'police'
            AND status = 'active'
        )
    );

-- Admins can view all events
CREATE POLICY "Admins can view all events"
    ON events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
            AND status = 'active'
        )
    );

-- Family members can view each other's critical events
CREATE POLICY "Family can view critical events"
    ON events FOR SELECT
    USING (
        severity = 'critical'
        AND (
            -- Parent viewing child's events
            EXISTS (
                SELECT 1 FROM family_links
                WHERE parent_id = auth.uid()
                AND child_id = events.user_id
                AND can_receive_alerts = true
            )
            OR
            -- Child viewing parent's events
            EXISTS (
                SELECT 1 FROM family_links
                WHERE child_id = auth.uid()
                AND parent_id = events.user_id
                AND can_receive_alerts = true
            )
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get recent events for a user
CREATE OR REPLACE FUNCTION get_recent_events(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_event_type TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    event_type TEXT,
    severity TEXT,
    event_data JSONB,
    location GEOGRAPHY,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.event_type,
        e.severity,
        e.event_data,
        e.location,
        e.created_at
    FROM events e
    WHERE e.user_id = p_user_id
        AND (p_event_type IS NULL OR e.event_type = p_event_type)
        AND (p_severity IS NULL OR e.severity = p_severity)
    ORDER BY e.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get critical events for family members
CREATE OR REPLACE FUNCTION get_family_critical_events(
    p_user_id UUID,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_name TEXT,
    event_type TEXT,
    event_data JSONB,
    location GEOGRAPHY,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.user_id,
        p.name as user_name,
        e.event_type,
        e.event_data,
        e.location,
        e.created_at
    FROM events e
    JOIN profiles p ON e.user_id = p.id
    WHERE e.severity = 'critical'
        AND e.created_at > NOW() - (p_hours || ' hours')::INTERVAL
        AND (
            -- Family members
            EXISTS (
                SELECT 1 FROM family_links fl
                WHERE (fl.parent_id = p_user_id AND fl.child_id = e.user_id)
                   OR (fl.child_id = p_user_id AND fl.parent_id = e.user_id)
            )
            OR e.user_id = p_user_id  -- Own events
        )
    ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REALTIME PUBLICATION (Enable Realtime for this table)
-- ============================================================================
-- This allows Supabase Realtime to broadcast changes
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- ============================================================================
-- SAMPLE DATA (For Testing)
-- ============================================================================
-- Insert a test event (will be removed in production)
-- Uncomment to test:
-- INSERT INTO events (user_id, event_type, severity, event_data)
-- SELECT 
--     id,
--     'PROFILE_UPDATED',
--     'info',
--     '{"field": "name", "old_value": "Test", "new_value": "Updated"}'::jsonb
-- FROM profiles
-- LIMIT 1;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration:

-- 1. Check table exists
-- SELECT COUNT(*) FROM events;

-- 2. Check columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'events';

-- 3. Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'events';

-- 4. Check RLS policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'events';

-- 5. Test event insertion
-- INSERT INTO events (user_id, event_type, severity, event_data)
-- VALUES (auth.uid(), 'USER_ONLINE', 'info', '{}'::jsonb);
