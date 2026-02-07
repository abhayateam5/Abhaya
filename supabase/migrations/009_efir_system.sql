-- ============================================================================
-- Migration: 009_efir_system.sql
-- Description: Add e-FIR (electronic First Information Report) system
-- ============================================================================

-- ============================================================================
-- e-FIRs Table (Electronic First Information Reports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS e_firs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_number TEXT UNIQUE NOT NULL, -- Format: FIR/YYYY/MM/XXXXX
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sos_id UUID REFERENCES sos_events(id) ON DELETE SET NULL,
    
    -- Complainant details (auto-filled from profile)
    complainant_name TEXT NOT NULL,
    complainant_phone TEXT NOT NULL,
    complainant_email TEXT,
    complainant_address TEXT,
    complainant_nationality TEXT,
    
    -- Incident details
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_location GEOGRAPHY(POINT, 4326),
    incident_address TEXT NOT NULL,
    incident_description TEXT NOT NULL,
    incident_type TEXT CHECK (incident_type IN (
        'assault',
        'theft',
        'harassment',
        'fraud',
        'missing_person',
        'accident',
        'other'
    )),
    
    -- Suspect information (optional)
    suspect_description TEXT,
    suspect_count INTEGER DEFAULT 0,
    
    -- Legal & Security
    tamper_proof_hash TEXT NOT NULL, -- SHA-256 hash of FIR content
    status TEXT NOT NULL CHECK (status IN (
        'draft',
        'submitted',
        'under_review',
        'registered',
        'closed',
        'rejected'
    )) DEFAULT 'draft',
    
    -- Police assignment
    police_station TEXT,
    assigned_officer_id UUID REFERENCES profiles(id),
    police_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    registered_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_efirs_user ON e_firs(user_id, created_at DESC);
CREATE INDEX idx_efirs_fir_number ON e_firs(fir_number);
CREATE INDEX idx_efirs_status ON e_firs(status, submitted_at DESC);
CREATE INDEX idx_efirs_police_station ON e_firs(police_station) WHERE status IN ('submitted', 'under_review');
CREATE INDEX idx_efirs_assigned_officer ON e_firs(assigned_officer_id) WHERE assigned_officer_id IS NOT NULL;

-- ============================================================================
-- Evidence Files Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS evidence_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    efir_id UUID NOT NULL REFERENCES e_firs(id) ON DELETE CASCADE,
    
    -- File details
    file_type TEXT NOT NULL CHECK (file_type IN (
        'photo',
        'audio',
        'video',
        'document',
        'gps_log',
        'other'
    )),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Supabase Storage URL
    file_size INTEGER, -- bytes
    file_hash TEXT, -- SHA-256 for integrity verification
    mime_type TEXT,
    
    -- Metadata
    description TEXT,
    captured_at TIMESTAMP WITH TIME ZONE,
    location GEOGRAPHY(POINT, 4326),
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evidence_efir ON evidence_files(efir_id, uploaded_at DESC);
CREATE INDEX idx_evidence_type ON evidence_files(file_type);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE e_firs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;

-- e-FIRs policies
CREATE POLICY "users_view_own_efirs" ON e_firs
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "users_create_own_efirs" ON e_firs
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_efirs" ON e_firs
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "police_view_submitted_efirs" ON e_firs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
        AND status IN ('submitted', 'under_review', 'registered', 'closed')
    );

CREATE POLICY "police_update_assigned_efirs" ON e_firs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
        AND (assigned_officer_id = auth.uid() OR assigned_officer_id IS NULL)
    );

-- Evidence files policies
CREATE POLICY "users_view_own_evidence" ON evidence_files
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM e_firs
            WHERE id = evidence_files.efir_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "users_insert_own_evidence" ON evidence_files
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM e_firs
            WHERE id = evidence_files.efir_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "police_view_evidence" ON evidence_files
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'police'
        )
        AND EXISTS (
            SELECT 1 FROM e_firs
            WHERE id = evidence_files.efir_id
            AND status IN ('submitted', 'under_review', 'registered', 'closed')
        )
    );

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to generate FIR number
CREATE OR REPLACE FUNCTION generate_fir_number()
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_month TEXT;
    v_sequence TEXT;
    v_count INTEGER;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');
    v_month := TO_CHAR(NOW(), 'MM');
    
    -- Get count of FIRs this month
    SELECT COUNT(*) + 1 INTO v_count
    FROM e_firs
    WHERE fir_number LIKE 'FIR/' || v_year || '/' || v_month || '/%';
    
    -- Format sequence with leading zeros (5 digits)
    v_sequence := LPAD(v_count::TEXT, 5, '0');
    
    RETURN 'FIR/' || v_year || '/' || v_month || '/' || v_sequence;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate tamper-proof hash
CREATE OR REPLACE FUNCTION calculate_efir_hash(
    p_fir_number TEXT,
    p_complainant_name TEXT,
    p_incident_date TIMESTAMP WITH TIME ZONE,
    p_incident_description TEXT
)
RETURNS TEXT AS $$
BEGIN
    -- Concatenate key fields and hash with SHA-256
    RETURN encode(
        digest(
            p_fir_number || '|' || 
            p_complainant_name || '|' || 
            p_incident_date::TEXT || '|' || 
            p_incident_description,
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant permissions
GRANT ALL ON e_firs TO authenticated;
GRANT ALL ON evidence_files TO authenticated;
GRANT EXECUTE ON FUNCTION generate_fir_number() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_efir_hash(TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TEXT) TO authenticated;
