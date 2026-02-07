-- ============================================================================
-- Migration: 007_geofencing_enhancements.sql
-- Description: Add zone tracking, alerts, and personal zones
-- ============================================================================

-- ============================================================================
-- Zone Entries Table (Track user movements through zones)
-- ============================================================================

CREATE TABLE IF NOT EXISTS zone_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Zone reference (can be safe_zones or risk_zones)
    zone_id UUID NOT NULL,
    zone_type TEXT NOT NULL CHECK (zone_type IN ('safe', 'risk')),
    zone_name TEXT, -- Cached for performance
    
    -- Entry/Exit tracking
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_time TIMESTAMP WITH TIME ZONE,
    entry_location GEOGRAPHY(POINT, 4326),
    exit_location GEOGRAPHY(POINT, 4326),
    
    -- Duration in zone (auto-calculated)
    duration_seconds INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_zone_entries_user ON zone_entries(user_id, entry_time DESC);
CREATE INDEX idx_zone_entries_zone ON zone_entries(zone_id, zone_type);
CREATE INDEX idx_zone_entries_active ON zone_entries(user_id) WHERE exit_time IS NULL;

-- ============================================================================
-- Zone Alerts Table (Store zone-based notifications)
-- ============================================================================

CREATE TABLE IF NOT EXISTS zone_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Zone reference
    zone_id UUID NOT NULL,
    zone_type TEXT NOT NULL CHECK (zone_type IN ('safe', 'risk')),
    zone_name TEXT,
    
    -- Alert details
    alert_type TEXT NOT NULL CHECK (alert_type IN ('entry', 'exit', 'proximity', 'warning')),
    message TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('info', 'warning', 'danger')) DEFAULT 'info',
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Location when alert triggered
    location GEOGRAPHY(POINT, 4326),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_zone_alerts_user ON zone_alerts(user_id, created_at DESC);
CREATE INDEX idx_zone_alerts_unread ON zone_alerts(user_id) WHERE is_read = false;
CREATE INDEX idx_zone_alerts_type ON zone_alerts(alert_type, severity);

-- ============================================================================
-- Add Personal Zones Support
-- ============================================================================

-- Add user_id to safe_zones for personal zones
ALTER TABLE safe_zones 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false;

-- Add user_id to risk_zones for personal danger zones
ALTER TABLE risk_zones 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false;

-- Indexes for personal zones
CREATE INDEX IF NOT EXISTS idx_safe_zones_user ON safe_zones(user_id) WHERE is_personal = true;
CREATE INDEX IF NOT EXISTS idx_risk_zones_user ON risk_zones(user_id) WHERE is_personal = true;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE zone_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_alerts ENABLE ROW LEVEL SECURITY;

-- zone_entries policies
CREATE POLICY "users_view_own_zone_entries" ON zone_entries
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_zone_entries" ON zone_entries
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_zone_entries" ON zone_entries
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "police_view_all_zone_entries" ON zone_entries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- zone_alerts policies
CREATE POLICY "users_view_own_zone_alerts" ON zone_alerts
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_zone_alerts" ON zone_alerts
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_zone_alerts" ON zone_alerts
    FOR UPDATE
    USING (user_id = auth.uid());

-- Personal zones policies (update existing tables)
CREATE POLICY "users_view_own_safe_zones" ON safe_zones
    FOR SELECT
    USING (
        is_personal = false OR user_id = auth.uid()
    );

CREATE POLICY "users_create_personal_safe_zones" ON safe_zones
    FOR INSERT
    WITH CHECK (user_id = auth.uid() AND is_personal = true);

CREATE POLICY "users_update_own_safe_zones" ON safe_zones
    FOR UPDATE
    USING (user_id = auth.uid() AND is_personal = true);

CREATE POLICY "users_delete_own_safe_zones" ON safe_zones
    FOR DELETE
    USING (user_id = auth.uid() AND is_personal = true);

CREATE POLICY "users_view_own_risk_zones" ON risk_zones
    FOR SELECT
    USING (
        is_personal = false OR user_id = auth.uid()
    );

CREATE POLICY "users_create_personal_risk_zones" ON risk_zones
    FOR INSERT
    WITH CHECK (user_id = auth.uid() AND is_personal = true);

CREATE POLICY "users_update_own_risk_zones" ON risk_zones
    FOR UPDATE
    USING (user_id = auth.uid() AND is_personal = true);

CREATE POLICY "users_delete_own_risk_zones" ON risk_zones
    FOR DELETE
    USING (user_id = auth.uid() AND is_personal = true);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to check if point is in any zone
CREATE OR REPLACE FUNCTION check_zones_at_location(
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    zone_id UUID,
    zone_type TEXT,
    zone_name TEXT,
    risk_level INTEGER,
    safety_rating INTEGER
) AS $$
BEGIN
    -- Check safe zones
    RETURN QUERY
    SELECT 
        sz.id,
        'safe'::TEXT,
        sz.name,
        NULL::INTEGER as risk_level,
        sz.safety_rating
    FROM safe_zones sz
    WHERE sz.is_active = true
    AND (sz.is_personal = false OR sz.user_id = p_user_id)
    AND (
        (sz.area IS NOT NULL AND ST_Intersects(
            sz.area::geometry,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
        ))
        OR
        (sz.center_point IS NOT NULL AND ST_DWithin(
            sz.center_point::geography,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
            sz.radius
        ))
    );
    
    -- Check risk zones
    RETURN QUERY
    SELECT 
        rz.id,
        'risk'::TEXT,
        rz.name,
        rz.risk_level,
        NULL::INTEGER as safety_rating
    FROM risk_zones rz
    WHERE rz.is_active = true
    AND (rz.is_personal = false OR rz.user_id = p_user_id)
    AND ST_Intersects(
        rz.area::geometry,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON zone_entries TO authenticated;
GRANT ALL ON zone_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION check_zones_at_location(NUMERIC, NUMERIC, UUID) TO authenticated;
