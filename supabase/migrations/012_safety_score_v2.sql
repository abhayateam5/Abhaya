-- ============================================================================
-- Migration: 012_safety_score_v2.sql
-- Description: Enhanced safety scoring system with weighted factors
-- ============================================================================

-- ============================================================================
-- Location Safety Scores Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS location_safety_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    area_name TEXT,
    safety_score INTEGER NOT NULL CHECK (safety_score >= 0 AND safety_score <= 100),
    
    -- Contributing factors
    crime_rate NUMERIC CHECK (crime_rate >= 0),
    lighting_quality INTEGER CHECK (lighting_quality >= 0 AND lighting_quality <= 100),
    population_density NUMERIC CHECK (population_density >= 0),
    police_presence BOOLEAN DEFAULT false,
    
    -- Metadata
    data_source TEXT CHECK (data_source IN ('official', 'crowdsourced', 'calculated')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for location queries
CREATE INDEX idx_location_safety_location ON location_safety_scores USING GIST(location);
CREATE INDEX idx_location_safety_score ON location_safety_scores(safety_score);

-- ============================================================================
-- Safety Score History Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS safety_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Composite score
    composite_score INTEGER NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
    
    -- Individual factor scores
    location_score INTEGER CHECK (location_score >= 0 AND location_score <= 100),
    time_score INTEGER CHECK (time_score >= 0 AND time_score <= 100),
    incident_score INTEGER CHECK (incident_score >= 0 AND incident_score <= 100),
    behavior_score INTEGER CHECK (behavior_score >= 0 AND behavior_score <= 100),
    battery_score INTEGER CHECK (battery_score >= 0 AND battery_score <= 100),
    
    -- Context
    location GEOGRAPHY(POINT, 4326),
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_safety_score_history_user ON safety_score_history(user_id, created_at DESC);
CREATE INDEX idx_safety_score_history_location ON safety_score_history USING GIST(location);
CREATE INDEX idx_safety_score_history_score ON safety_score_history(composite_score);

-- ============================================================================
-- Safety Incidents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    
    -- Incident details
    incident_type TEXT NOT NULL CHECK (incident_type IN (
        'theft',
        'assault',
        'harassment',
        'suspicious_activity',
        'vandalism',
        'other'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    
    -- Reporting
    reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'verified', 'rejected', 'resolved')) DEFAULT 'pending',
    
    -- Timestamps
    incident_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_safety_incidents_location ON safety_incidents USING GIST(location);
CREATE INDEX idx_safety_incidents_time ON safety_incidents(incident_time DESC);
CREATE INDEX idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX idx_safety_incidents_severity ON safety_incidents(severity);
CREATE INDEX idx_safety_incidents_status ON safety_incidents(status);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get location safety score for a given point
CREATE OR REPLACE FUNCTION get_location_safety_score(
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_radius_meters INTEGER DEFAULT 1000
)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER;
BEGIN
    -- Find average safety score within radius
    SELECT COALESCE(AVG(safety_score)::INTEGER, 75) INTO v_score
    FROM location_safety_scores
    WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_meters
    );
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get recent incidents score for a location
CREATE OR REPLACE FUNCTION get_recent_incidents_score(
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_radius_meters INTEGER DEFAULT 1000,
    p_days INTEGER DEFAULT 7
)
RETURNS INTEGER AS $$
DECLARE
    v_incident_count INTEGER;
    v_score INTEGER;
BEGIN
    -- Count verified incidents within radius and time period
    SELECT COUNT(*) INTO v_incident_count
    FROM safety_incidents
    WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_meters
    )
    AND incident_time >= NOW() - (p_days || ' days')::INTERVAL
    AND status IN ('verified', 'pending');
    
    -- Calculate score: 100 - (count × 10), minimum 0
    v_score := GREATEST(100 - (v_incident_count * 10), 0);
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get time of day safety score
CREATE OR REPLACE FUNCTION get_time_of_day_score()
RETURNS INTEGER AS $$
DECLARE
    v_hour INTEGER;
    v_score INTEGER;
BEGIN
    v_hour := EXTRACT(HOUR FROM NOW());
    
    -- Daytime (6 AM - 6 PM): 100
    IF v_hour >= 6 AND v_hour < 18 THEN
        v_score := 100;
    -- Evening (6 PM - 10 PM): 75
    ELSIF v_hour >= 18 AND v_hour < 22 THEN
        v_score := 75;
    -- Late night (10 PM - 2 AM): 50
    ELSIF v_hour >= 22 OR v_hour < 2 THEN
        v_score := 50;
    -- Early morning (2 AM - 6 AM): 25
    ELSE
        v_score := 25;
    END IF;
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get user behavior score
CREATE OR REPLACE FUNCTION get_user_behavior_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_checkin_count INTEGER;
    v_sos_false_alarms INTEGER;
    v_geofence_violations INTEGER;
    v_score INTEGER := 50; -- Base score
BEGIN
    -- Check-in frequency (last 7 days)
    SELECT COUNT(*) INTO v_checkin_count
    FROM checkpoints
    WHERE user_id = p_user_id
    AND checked_in_at >= NOW() - INTERVAL '7 days';
    
    -- SOS false alarms (last 30 days)
    SELECT COUNT(*) INTO v_sos_false_alarms
    FROM sos_events
    WHERE user_id = p_user_id
    AND status = 'cancelled'
    AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Geofence violations (last 7 days)
    SELECT COUNT(*) INTO v_geofence_violations
    FROM geofence_alerts
    WHERE user_id = p_user_id
    AND alert_type = 'exit'
    AND created_at >= NOW() - INTERVAL '7 days';
    
    -- Calculate score
    v_score := v_score + LEAST(v_checkin_count * 5, 30); -- +5 per check-in, max +30
    v_score := v_score - (v_sos_false_alarms * 15); -- -15 per false alarm
    v_score := v_score - (v_geofence_violations * 5); -- -5 per violation
    
    -- Clamp to 0-100
    v_score := GREATEST(LEAST(v_score, 100), 0);
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE location_safety_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;

-- Location safety scores - public read
CREATE POLICY "public_read_location_safety" ON location_safety_scores
    FOR SELECT
    USING (true);

CREATE POLICY "admin_manage_location_safety" ON location_safety_scores
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Safety score history - users view own
CREATE POLICY "users_view_own_score_history" ON safety_score_history
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_score_history" ON safety_score_history
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Test user policies for safety_score_history
CREATE POLICY "test_user_view_score_history" ON safety_score_history
    FOR SELECT
    USING (user_id = 'd74a4a73-7938-43c6-b54f-98b604579972');

CREATE POLICY "test_user_insert_score_history" ON safety_score_history
    FOR INSERT
    WITH CHECK (user_id = 'd74a4a73-7938-43c6-b54f-98b604579972');

-- Safety incidents - public read, authenticated report
CREATE POLICY "public_read_incidents" ON safety_incidents
    FOR SELECT
    USING (true);

CREATE POLICY "authenticated_report_incidents" ON safety_incidents
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "users_update_own_incidents" ON safety_incidents
    FOR UPDATE
    USING (reported_by = auth.uid());

CREATE POLICY "admin_manage_incidents" ON safety_incidents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Test user policy for incidents
CREATE POLICY "test_user_report_incidents" ON safety_incidents
    FOR INSERT
    WITH CHECK (reported_by = 'd74a4a73-7938-43c6-b54f-98b604579972');

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT SELECT ON location_safety_scores TO authenticated, anon;
GRANT SELECT, INSERT ON safety_score_history TO authenticated, anon;
GRANT SELECT, INSERT ON safety_incidents TO authenticated, anon;

GRANT EXECUTE ON FUNCTION get_location_safety_score(NUMERIC, NUMERIC, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_recent_incidents_score(NUMERIC, NUMERIC, INTEGER, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_time_of_day_score() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_behavior_score(UUID) TO authenticated, anon;
