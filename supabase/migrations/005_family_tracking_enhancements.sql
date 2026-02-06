-- ============================================================================
-- 005_FAMILY_TRACKING_ENHANCEMENTS.SQL
-- Enhance family_links table with new features for Phase 6
-- ============================================================================

-- Add new columns to family_links table
ALTER TABLE family_links
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'revoked')),
ADD COLUMN IF NOT EXISTS tracking_consent_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS emergency_override BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delegation_type TEXT DEFAULT 'parent-child' CHECK (delegation_type IN ('parent-child', 'guardian-ward', 'emergency-contact', 'temporary-guardian')),
ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for invite codes
CREATE INDEX IF NOT EXISTS idx_family_links_invite_code ON family_links(invite_code) WHERE invite_code IS NOT NULL;

-- Create index for consent expiration
CREATE INDEX IF NOT EXISTS idx_family_links_consent ON family_links(tracking_consent_until) WHERE status = 'active';

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_family_links_status ON family_links(status);

-- ============================================================================
-- PANIC WORDS TABLE
-- Store encrypted panic words for silent SOS triggers
-- ============================================================================

CREATE TABLE IF NOT EXISTS panic_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Encrypted panic word (using bcrypt or similar)
    encrypted_word TEXT NOT NULL,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Only one active panic word per user
    UNIQUE(user_id, is_active)
);

-- Index for quick lookups
CREATE INDEX idx_panic_words_user ON panic_words(user_id) WHERE is_active = true;

-- ============================================================================
-- CHECK-INS TABLE
-- Track "I'm safe" check-ins from family members
-- ============================================================================

CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Check-in data
    location GEOGRAPHY(POINT),
    message TEXT,
    battery_level INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user check-ins
CREATE INDEX idx_check_ins_user ON check_ins(user_id);
CREATE INDEX idx_check_ins_created ON check_ins(created_at DESC);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS
ALTER TABLE panic_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Panic words policies
CREATE POLICY "users_manage_own_panic_word" ON panic_words
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "police_view_panic_words_during_sos" ON panic_words
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'police'
        )
        AND EXISTS (
            SELECT 1 FROM sos_events
            WHERE sos_events.user_id = panic_words.user_id
            AND sos_events.status IN ('active', 'in_progress')
        )
    );

-- Check-ins policies
CREATE POLICY "users_create_own_check_ins" ON check_ins
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_view_own_check_ins" ON check_ins
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "family_view_check_ins" ON check_ins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM family_links
            WHERE (family_links.parent_id = auth.uid() AND family_links.child_id = check_ins.user_id)
               OR (family_links.child_id = auth.uid() AND family_links.parent_id = check_ins.user_id)
            AND family_links.status = 'active'
        )
    );

CREATE POLICY "police_view_all_check_ins" ON check_ins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'police'
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8-character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM family_links WHERE invite_code = code) INTO exists;
        
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to expire tracking consent
CREATE OR REPLACE FUNCTION expire_tracking_consent()
RETURNS void AS $$
BEGIN
    UPDATE family_links
    SET status = 'expired'
    WHERE status = 'active'
    AND tracking_consent_until IS NOT NULL
    AND tracking_consent_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if tracking is allowed
CREATE OR REPLACE FUNCTION is_tracking_allowed(
    p_parent_id UUID,
    p_child_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    link_record RECORD;
    sos_active BOOLEAN;
BEGIN
    -- Get family link
    SELECT * INTO link_record
    FROM family_links
    WHERE parent_id = p_parent_id
    AND child_id = p_child_id;
    
    -- Link doesn't exist
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Link not active
    IF link_record.status != 'active' THEN
        -- Check for emergency override
        SELECT EXISTS(
            SELECT 1 FROM sos_events
            WHERE user_id = p_child_id
            AND status IN ('active', 'in_progress')
        ) INTO sos_active;
        
        -- Allow if SOS active and emergency override enabled
        IF sos_active AND link_record.emergency_override THEN
            RETURN true;
        END IF;
        
        RETURN false;
    END IF;
    
    -- Check consent expiration
    IF link_record.tracking_consent_until IS NOT NULL 
       AND link_record.tracking_consent_until < NOW() THEN
        RETURN false;
    END IF;
    
    -- Check permissions
    RETURN link_record.can_view_location;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on family_links changes
CREATE OR REPLACE FUNCTION update_family_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER family_links_updated_at
    BEFORE UPDATE ON family_links
    FOR EACH ROW
    EXECUTE FUNCTION update_family_links_updated_at();

-- Update updated_at on panic_words changes
CREATE OR REPLACE FUNCTION update_panic_words_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER panic_words_updated_at
    BEFORE UPDATE ON panic_words
    FOR EACH ROW
    EXECUTE FUNCTION update_panic_words_updated_at();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Comment out in production
-- INSERT INTO family_links (parent_id, child_id, tracking_consent_until, status)
-- VALUES (
--     (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1),
--     (SELECT id FROM profiles WHERE role = 'child' LIMIT 1),
--     NOW() + INTERVAL '24 hours',
--     'active'
-- );
