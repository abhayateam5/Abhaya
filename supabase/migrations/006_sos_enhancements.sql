-- ============================================================================
-- Migration: 006_sos_enhancements.sql
-- Description: Enhance SOS system with trigger modes, evidence, and escalation
-- ============================================================================

-- Add new columns to sos_events table
ALTER TABLE sos_events
ADD COLUMN IF NOT EXISTS trigger_mode TEXT CHECK (trigger_mode IN ('button', 'silent', 'panic_word', 'shake', 'volume')) DEFAULT 'button',
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS false_alarm_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS escalation_level INTEGER CHECK (escalation_level >= 0 AND escalation_level <= 3) DEFAULT 0;

-- Create index for trigger mode queries
CREATE INDEX IF NOT EXISTS idx_sos_trigger_mode ON sos_events(trigger_mode);

-- ============================================================================
-- SOS Evidence Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sos_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sos_event_id UUID NOT NULL REFERENCES sos_events(id) ON DELETE CASCADE,
    
    -- Evidence type
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('photo', 'audio', 'screen', 'location', 'sensor')),
    
    -- Storage
    storage_path TEXT NOT NULL, -- Supabase storage path
    file_size INTEGER, -- Bytes
    mime_type TEXT,
    
    -- Metadata
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    camera_type TEXT CHECK (camera_type IN ('front', 'rear', 'unknown')), -- For photos
    duration_seconds INTEGER, -- For audio/video
    
    -- Sensor data (JSON for accelerometer, WiFi, etc.)
    sensor_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sos_evidence_event ON sos_evidence(sos_event_id);
CREATE INDEX idx_sos_evidence_type ON sos_evidence(evidence_type);
CREATE INDEX idx_sos_evidence_captured ON sos_evidence(captured_at DESC);

-- ============================================================================
-- SOS Escalations Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sos_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sos_event_id UUID NOT NULL REFERENCES sos_events(id) ON DELETE CASCADE,
    
    -- Escalation details
    escalation_level INTEGER NOT NULL CHECK (escalation_level >= 0 AND escalation_level <= 3),
    target_type TEXT NOT NULL CHECK (target_type IN ('family', 'police', 'emergency_services', 'embassy')),
    
    -- Targets notified
    notified_users UUID[], -- Array of user IDs
    notified_count INTEGER DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'acknowledged', 'failed')) DEFAULT 'pending',
    
    -- Timing
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES profiles(id),
    
    -- Metadata
    metadata JSONB, -- Additional context (e.g., police station IDs, embassy contact info)
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sos_escalations_event ON sos_escalations(sos_event_id);
CREATE INDEX idx_sos_escalations_level ON sos_escalations(escalation_level);
CREATE INDEX idx_sos_escalations_status ON sos_escalations(status);
CREATE INDEX idx_sos_escalations_triggered ON sos_escalations(triggered_at DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE sos_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_escalations ENABLE ROW LEVEL SECURITY;

-- sos_evidence policies
CREATE POLICY "users_view_own_sos_evidence" ON sos_evidence
    FOR SELECT
    USING (
        sos_event_id IN (
            SELECT id FROM sos_events WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "users_insert_own_sos_evidence" ON sos_evidence
    FOR INSERT
    WITH CHECK (
        sos_event_id IN (
            SELECT id FROM sos_events WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "police_view_all_sos_evidence" ON sos_evidence
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

-- sos_escalations policies
CREATE POLICY "users_view_own_sos_escalations" ON sos_escalations
    FOR SELECT
    USING (
        sos_event_id IN (
            SELECT id FROM sos_events WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "police_view_all_sos_escalations" ON sos_escalations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
    );

CREATE POLICY "system_insert_sos_escalations" ON sos_escalations
    FOR INSERT
    WITH CHECK (true); -- Allow system to create escalations

CREATE POLICY "system_update_sos_escalations" ON sos_escalations
    FOR UPDATE
    USING (true); -- Allow system to update escalation status

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to check SOS rate limit
CREATE OR REPLACE FUNCTION check_sos_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    recent_sos_count INTEGER;
BEGIN
    -- Count SOS events in last hour
    SELECT COUNT(*)
    INTO recent_sos_count
    FROM sos_events
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour'
    AND status != 'false_alarm';
    
    -- Return true if under limit (max 3 per hour)
    RETURN recent_sos_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next escalation level
CREATE OR REPLACE FUNCTION get_next_escalation_level(p_sos_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_level INTEGER;
BEGIN
    -- Get highest escalation level so far
    SELECT COALESCE(MAX(escalation_level), -1)
    INTO current_level
    FROM sos_escalations
    WHERE sos_event_id = p_sos_id;
    
    -- Return next level (max 3)
    RETURN LEAST(current_level + 1, 3);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON sos_evidence TO authenticated;
GRANT ALL ON sos_escalations TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION check_sos_rate_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_escalation_level(UUID) TO authenticated;
