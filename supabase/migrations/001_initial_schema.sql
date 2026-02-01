-- ABHAYA System - Production-Grade Schema (IMPROVED)
-- Based on architectural review and safety-critical requirements
-- This schema is designed for: Zero-trust security, Real-time performance, Legal audit trails

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Performance monitoring

-- ============================================================================
-- PROFILES TABLE (Extends auth.users)
-- ============================================================================
-- Design principle: auth.users is source of truth, profiles extends identity
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Core identity
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE, -- UNIQUE for phone OTP
    
    -- Role-based access (finite state)
    role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'police', 'admin')) DEFAULT 'parent',
    
    -- Status management (soft-delete, abuse handling)
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'blocked', 'deleted')) DEFAULT 'active',
    
    -- Optional fields
    photo TEXT,
    nationality TEXT,
    passport_number TEXT,
    aadhar_number TEXT,
    
    -- Emergency contacts (JSONB for flexibility)
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    
    -- Safety score (0-100)
    safety_score INTEGER DEFAULT 75 CHECK (safety_score >= 0 AND safety_score <= 100),
    
    -- Police-specific fields
    badge_number TEXT,
    department TEXT,
    rank TEXT,
    jurisdiction TEXT, -- Geographic jurisdiction for police
    
    -- Audit fields
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES profiles(id), -- Who verified this user
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role) WHERE status = 'active';
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_badge ON profiles(badge_number) WHERE badge_number IS NOT NULL;
CREATE INDEX idx_profiles_jurisdiction ON profiles(jurisdiction) WHERE jurisdiction IS NOT NULL;

-- ============================================================================
-- FAMILY LINKS (Many-to-Many)
-- ============================================================================
-- Design: Composite PK prevents duplicates, no surrogate ID needed
CREATE TABLE family_links (
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Link metadata
    relationship_type TEXT DEFAULT 'parent-child' CHECK (relationship_type IN ('parent-child', 'guardian-ward')),
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Permissions
    can_view_location BOOLEAN DEFAULT true,
    can_receive_alerts BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (parent_id, child_id),
    
    -- Prevent self-linking
    CHECK (parent_id != child_id)
);

-- Indexes
CREATE INDEX idx_family_links_parent ON family_links(parent_id);
CREATE INDEX idx_family_links_child ON family_links(child_id);

-- ============================================================================
-- LIVE LOCATIONS (Latest State Model)
-- ============================================================================
-- Design: One row per user, UPDATE not INSERT (performance critical)
CREATE TABLE live_locations (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- PostGIS geography (accurate distance calculations)
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    
    -- Location metadata
    accuracy NUMERIC, -- meters
    altitude NUMERIC, -- meters
    speed NUMERIC, -- m/s
    heading NUMERIC, -- degrees (0-360)
    
    -- Safety context
    in_safe_zone BOOLEAN DEFAULT true,
    current_zone_id UUID, -- Reference to safe_zones
    safety_level TEXT CHECK (safety_level IN ('safe', 'caution', 'danger')) DEFAULT 'safe',
    
    -- Device info
    device_id TEXT,
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    network_type TEXT, -- '4G', '5G', 'WiFi', etc.
    
    -- Health vitals (optional, for wearable integration)
    vitals JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamp (critical for staleness detection)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    
    -- Staleness check (location older than 5 minutes = stale)
   -- is_stale BOOLEAN GENERATED ALWAYS AS (
   --     updated_at < NOW() - INTERVAL '5 minutes'
    --) STORED
);

-- 🚨 CRITICAL INDEX for geo-fencing performance
CREATE INDEX idx_live_locations_geo ON live_locations USING GIST(location);
CREATE INDEX idx_live_locations_updated ON live_locations(updated_at DESC);
CREATE INDEX idx_live_locations_safety ON live_locations(safety_level) WHERE safety_level IN ('caution', 'danger');

-- ============================================================================
-- SOS EVENTS (Immutable Audit Trail)
-- ============================================================================
-- Design: Finite state machine, immutable history, legal evidence
CREATE TABLE sos_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who triggered it
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL, -- Denormalized for audit trail
    user_phone TEXT NOT NULL, -- Denormalized for audit trail
    
    -- Status (finite state machine)
    status TEXT NOT NULL CHECK (status IN ('triggered', 'acknowledged', 'responding', 'verified', 'resolved', 'false_alarm')) DEFAULT 'triggered',
    
    -- Priority (auto-calculated or manual)
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'critical',
    
    -- Location snapshot (immutable, legal evidence)
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT, -- Reverse geocoded address
    
    -- Evidence
    description TEXT,
    audio_evidence TEXT, -- Storage URL
    photos TEXT[] DEFAULT ARRAY[]::TEXT[], -- Storage URLs
    
    -- Response tracking
    acknowledged_by UUID REFERENCES profiles(id), -- First responder
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    responding_officer_id UUID REFERENCES profiles(id),
    responding_officer_name TEXT,
    response_time TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    verified_by UUID REFERENCES profiles(id), -- Police verification
    verified_at TIMESTAMP WITH TIME ZONE,
    resolution_time TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Legal/blockchain
    blockchain_hash TEXT, -- For tamper-proof audit
    
    -- Timestamps (immutable)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sos_location ON sos_events USING GIST(location);
CREATE INDEX idx_sos_user_id ON sos_events(user_id);
CREATE INDEX idx_sos_status ON sos_events(status) WHERE status IN ('triggered', 'acknowledged', 'responding');
CREATE INDEX idx_sos_priority ON sos_events(priority);
CREATE INDEX idx_sos_created ON sos_events(created_at DESC);
CREATE INDEX idx_sos_status_priority ON sos_events(status, priority);

-- ============================================================================
-- LOCATION HISTORY (Time-series data)
-- ============================================================================
-- Design: Separate from live_locations for performance
CREATE TABLE location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    accuracy NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partitioning by month (for large-scale data)
-- CREATE TABLE location_history_2026_01 PARTITION OF location_history
-- FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Indexes
CREATE INDEX idx_location_history_user ON location_history(user_id, recorded_at DESC);
CREATE INDEX idx_location_history_geo ON location_history USING GIST(location);

-- Auto-delete old history (keep 90 days)
-- Implemented via cron job or pg_cron extension

-- ============================================================================
-- SAFE ZONES (Predefined safe areas)
-- ============================================================================
CREATE TABLE safe_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('tourist_spot', 'hotel', 'hospital', 'embassy', 'police_station', 'public_place')),
    
    -- PostGIS polygon or point + radius
    area GEOGRAPHY(POLYGON, 4326), -- For complex shapes
    center_point GEOGRAPHY(POINT, 4326), -- For simple circles
    radius INTEGER, -- meters (if using center_point)
    
    address TEXT,
    contact_phone TEXT,
    operating_hours TEXT,
    
    -- Safety rating (1-5)
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Either area OR (center_point + radius) must be set
    CHECK (
        (area IS NOT NULL) OR 
        (center_point IS NOT NULL AND radius IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_safe_zones_area ON safe_zones USING GIST(area) WHERE area IS NOT NULL;
CREATE INDEX idx_safe_zones_center ON safe_zones USING GIST(center_point) WHERE center_point IS NOT NULL;
CREATE INDEX idx_safe_zones_type ON safe_zones(type) WHERE is_active = true;

-- ============================================================================
-- RISK ZONES (Danger areas)
-- ============================================================================
CREATE TABLE risk_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    
    -- PostGIS polygon
    area GEOGRAPHY(POLYGON, 4326) NOT NULL,
    
    -- Risk level (1-10, higher = more dangerous)
    risk_level INTEGER NOT NULL CHECK (risk_level >= 1 AND risk_level <= 10),
    
    -- Reason
    reason TEXT, -- 'high crime rate', 'recent incidents', etc.
    
    -- Time-based risk (some areas only dangerous at night)
    risk_hours INTEGER[], -- Array of hours (0-23) when risky
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE, -- Temporary risk zones
    
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_risk_zones_area ON risk_zones USING GIST(area);
CREATE INDEX idx_risk_zones_active ON risk_zones(is_active, risk_level) WHERE is_active = true;

-- ============================================================================
-- POLICE STATIONS
-- ============================================================================
CREATE TABLE police_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    jurisdiction TEXT,
    station_type TEXT CHECK (station_type IN ('main', 'sub', 'outpost')),
    
    -- Capacity
    officers_count INTEGER DEFAULT 0,
    available_officers INTEGER DEFAULT 0,
    
    -- Status
    is_operational BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_police_stations_location ON police_stations USING GIST(location);
CREATE INDEX idx_police_stations_jurisdiction ON police_stations(jurisdiction);

-- ============================================================================
-- SAFETY SCORES (Time-series)
-- ============================================================================
CREATE TABLE safety_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Overall score (0-100)
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    
    -- Factor breakdown (JSONB for flexibility)
    factors JSONB NOT NULL,
    
    -- Level (derived from score)
    level TEXT NOT NULL CHECK (level IN ('excellent', 'good', 'moderate', 'low', 'critical')),
    
    -- Timestamp
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_safety_scores_user ON safety_scores(user_id, calculated_at DESC);
CREATE INDEX idx_safety_scores_level ON safety_scores(level) WHERE level IN ('low', 'critical');

-- Auto-delete old scores (keep 30 days)
-- Implemented via cron job

-- ============================================================================
-- E-FIR REPORTS
-- ============================================================================
CREATE TABLE efir_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Complainant details (denormalized for legal record)
    complainant_name TEXT NOT NULL,
    complainant_phone TEXT NOT NULL,
    complainant_email TEXT,
    complainant_address TEXT NOT NULL,
    
    -- Incident details
    incident_type TEXT NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_location GEOGRAPHY(POINT, 4326),
    incident_address TEXT NOT NULL,
    incident_description TEXT NOT NULL,
    
    -- Suspect details (optional)
    suspect_description TEXT,
    
    -- Evidence
    witnesses TEXT,
    evidence_files TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Status (workflow)
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'under_review', 'assigned', 'resolved', 'closed')) DEFAULT 'draft',
    
    -- FIR number (assigned after submission)
    fir_number TEXT UNIQUE,
    
    -- Assignment
    assigned_officer_id UUID REFERENCES profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_efir_user ON efir_reports(user_id);
CREATE INDEX idx_efir_status ON efir_reports(status);
CREATE INDEX idx_efir_location ON efir_reports USING GIST(incident_location) WHERE incident_location IS NOT NULL;
CREATE INDEX idx_efir_fir_number ON efir_reports(fir_number) WHERE fir_number IS NOT NULL;
CREATE INDEX idx_efir_assigned ON efir_reports(assigned_officer_id) WHERE assigned_officer_id IS NOT NULL;

-- ============================================================================
-- ITINERARIES
-- ============================================================================
CREATE TABLE itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (end_date > start_date)
);

-- Indexes
CREATE INDEX idx_itineraries_user ON itineraries(user_id);
CREATE INDEX idx_itineraries_active ON itineraries(is_active, start_date, end_date);

-- ============================================================================
-- DESTINATIONS
-- ============================================================================
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    arrival_date TIMESTAMP WITH TIME ZONE NOT NULL,
    departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (departure_date > arrival_date)
);

-- Indexes
CREATE INDEX idx_destinations_itinerary ON destinations(itinerary_id, order_index);
CREATE INDEX idx_destinations_location ON destinations USING GIST(location);

-- ============================================================================
-- CHECKPOINTS
-- ============================================================================
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'checked_in', 'missed', 'skipped')) DEFAULT 'pending',
    checked_in_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_checkpoints_destination ON checkpoints(destination_id);
CREATE INDEX idx_checkpoints_status ON checkpoints(status, time);

-- ============================================================================
-- NOTIFICATIONS (For push notifications)
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sos_alert', 'location_alert', 'safety_score', 'efir_update', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- AUDIT LOG (Immutable)
-- ============================================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Sample safe zones (Bangalore)
INSERT INTO safe_zones (name, type, center_point, radius, address, safety_rating) VALUES
('Bangalore Palace', 'tourist_spot', ST_GeogFromText('POINT(77.5926 12.9984)'), 200, 'Vasanth Nagar, Bangalore', 5),
('Cubbon Park', 'public_place', ST_GeogFromText('POINT(77.5946 12.9716)'), 500, 'Kasturba Road, Bangalore', 4),
('Vidhana Soudha', 'public_place', ST_GeogFromText('POINT(77.5906 12.9796)'), 300, 'Dr Ambedkar Road, Bangalore', 5),
('Kempegowda International Airport', 'public_place', ST_GeogFromText('POINT(77.7064 13.1986)'), 1000, 'Devanahalli, Bangalore', 5);

-- Sample police stations
INSERT INTO police_stations (name, location, address, phone, jurisdiction, station_type) VALUES
('Cubbon Park Police Station', ST_GeogFromText('POINT(77.5946 12.9716)'), 'Kasturba Road, Bangalore', '+91-80-22942222', 'Central Bangalore', 'main'),
('Vidhana Soudha Police Station', ST_GeogFromText('POINT(77.5906 12.9796)'), 'Dr Ambedkar Road, Bangalore', '+91-80-22942333', 'Central Bangalore', 'sub'),
('Airport Police Station', ST_GeogFromText('POINT(77.7064 13.1986)'), 'KIAL, Devanahalli', '+91-80-22942444', 'North Bangalore', 'main');
