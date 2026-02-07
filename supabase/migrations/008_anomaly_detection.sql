-- ============================================================================
-- Migration: 008_anomaly_detection.sql
-- Description: Add anomaly detection and enhanced checkpoint tracking
-- ============================================================================

-- ============================================================================
-- Anomalies Table (Track detected anomalies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    itinerary_id UUID REFERENCES itineraries(id) ON DELETE SET NULL,
    
    -- Anomaly details
    type TEXT NOT NULL CHECK (type IN (
        'inactivity',
        'route_deviation',
        'speed_anomaly',
        'gps_loss',
        'unusual_hours',
        'battery_drain',
        'missed_checkpoint'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    description TEXT NOT NULL,
    
    -- Location when detected
    location GEOGRAPHY(POINT, 4326),
    
    -- Anomaly-specific data (JSON)
    metadata JSONB, -- e.g., {deviation_distance: 3200, expected_speed: 60, actual_speed: 120}
    
    -- Actions taken
    auto_sos_triggered BOOLEAN DEFAULT false,
    sos_id UUID REFERENCES sos_events(id),
    family_notified BOOLEAN DEFAULT false,
    
    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_anomalies_user ON anomalies(user_id, created_at DESC);
CREATE INDEX idx_anomalies_type ON anomalies(type, severity);
CREATE INDEX idx_anomalies_unresolved ON anomalies(user_id) WHERE resolved = false;
CREATE INDEX idx_anomalies_critical ON anomalies(severity) WHERE severity = 'critical' AND resolved = false;

-- ============================================================================
-- Enhance Check-ins Table
-- ============================================================================

-- Add missed checkpoint tracking
ALTER TABLE checkpoints 
ADD COLUMN IF NOT EXISTS is_missed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS missed_alert_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expected_checkin_time TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- User Activity Tracking (for inactivity detection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'location_update',
        'checkin',
        'sos_trigger',
        'app_interaction'
    )),
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_activity_user ON user_activity(user_id, created_at DESC);
CREATE INDEX idx_user_activity_recent ON user_activity(user_id) 
    WHERE created_at > NOW() - INTERVAL '1 hour';

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Anomalies policies
CREATE POLICY "users_view_own_anomalies" ON anomalies
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_anomalies" ON anomalies
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_anomalies" ON anomalies
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "police_view_all_anomalies" ON anomalies
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- User activity policies
CREATE POLICY "users_view_own_activity" ON user_activity
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_activity" ON user_activity
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get last user activity
CREATE OR REPLACE FUNCTION get_last_activity(p_user_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN (
        SELECT created_at
        FROM user_activity
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect inactivity
CREATE OR REPLACE FUNCTION detect_inactivity(
    p_user_id UUID,
    p_threshold_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
    inactive BOOLEAN,
    minutes_inactive INTEGER,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_last_activity TIMESTAMP WITH TIME ZONE;
    v_minutes_inactive INTEGER;
BEGIN
    v_last_activity := get_last_activity(p_user_id);
    
    IF v_last_activity IS NULL THEN
        RETURN QUERY SELECT false, 0, NULL::TIMESTAMP WITH TIME ZONE;
        RETURN;
    END IF;
    
    v_minutes_inactive := EXTRACT(EPOCH FROM (NOW() - v_last_activity)) / 60;
    
    RETURN QUERY SELECT 
        v_minutes_inactive >= p_threshold_minutes,
        v_minutes_inactive,
        v_last_activity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_lat NUMERIC DEFAULT NULL,
    p_lng NUMERIC DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
    v_location GEOGRAPHY(POINT, 4326);
BEGIN
    -- Create location point if coordinates provided
    IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
        v_location := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
    END IF;
    
    -- Insert activity
    INSERT INTO user_activity (user_id, activity_type, location)
    VALUES (p_user_id, p_activity_type, v_location)
    RETURNING id INTO v_activity_id;
    
    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON anomalies TO authenticated;
GRANT ALL ON user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_last_activity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_inactivity(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity(UUID, TEXT, NUMERIC, NUMERIC) TO authenticated;
