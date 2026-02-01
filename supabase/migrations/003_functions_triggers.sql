-- ABHAYA System - PostgreSQL Functions & Triggers
-- Production-grade geospatial queries, safety calculations, and automation

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sos_events_updated_at BEFORE UPDATE ON sos_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_efir_reports_updated_at BEFORE UPDATE ON efir_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- GEOSPATIAL FUNCTIONS
-- ============================================================================

-- Find nearby safe zones within radius
CREATE OR REPLACE FUNCTION find_nearby_safe_zones(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    center_point GEOGRAPHY,
    radius INTEGER,
    address TEXT,
    safety_rating INTEGER,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sz.id,
        sz.name,
        sz.type,
        sz.center_point,
        sz.radius,
        sz.address,
        sz.safety_rating,
        ST_Distance(
            COALESCE(sz.center_point, ST_Centroid(sz.area::geometry)::geography),
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')
        ) as distance
    FROM safe_zones sz
    WHERE 
        sz.is_active = true
        AND (
            -- Check point-based zones
            (sz.center_point IS NOT NULL AND ST_DWithin(
                sz.center_point,
                ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
                COALESCE(sz.radius, radius_meters)
            ))
            OR
            -- Check polygon-based zones
            (sz.area IS NOT NULL AND ST_DWithin(
                sz.area,
                ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
                radius_meters
            ))
        )
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Find nearest police station
CREATE OR REPLACE FUNCTION find_nearest_police_station(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    location GEOGRAPHY,
    address TEXT,
    phone TEXT,
    jurisdiction TEXT,
    station_type TEXT,
    available_officers INTEGER,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.name,
        ps.location,
        ps.address,
        ps.phone,
        ps.jurisdiction,
        ps.station_type,
        ps.available_officers,
        ST_Distance(
            ps.location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')
        ) as distance
    FROM police_stations ps
    WHERE ps.is_operational = true
    ORDER BY distance ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Check if location is in a safe zone
CREATE OR REPLACE FUNCTION is_in_safe_zone(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION
)
RETURNS BOOLEAN AS $$
DECLARE
    in_zone BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM safe_zones sz
        WHERE 
            sz.is_active = true
            AND (
                -- Check point-based zones
                (sz.center_point IS NOT NULL AND ST_DWithin(
                    sz.center_point,
                    ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
                    sz.radius
                ))
                OR
                -- Check polygon-based zones
                (sz.area IS NOT NULL AND ST_Intersects(
                    sz.area::geometry,
                    ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')::geometry
                ))
            )
    ) INTO in_zone;
    
    RETURN in_zone;
END;
$$ LANGUAGE plpgsql;

-- Check if location is in a danger zone
CREATE OR REPLACE FUNCTION is_in_danger_zone(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION
)
RETURNS BOOLEAN AS $$
DECLARE
    in_risk_zone BOOLEAN;
    recent_alerts INTEGER;
    current_hour INTEGER;
BEGIN
    current_hour := EXTRACT(HOUR FROM NOW());
    
    -- Check if in predefined risk zone
    SELECT EXISTS (
        SELECT 1
        FROM risk_zones rz
        WHERE 
            rz.is_active = true
            AND (rz.valid_until IS NULL OR rz.valid_until > NOW())
            AND ST_Intersects(
                rz.area::geometry,
                ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')::geometry
            )
            AND (
                rz.risk_hours IS NULL OR
                current_hour = ANY(rz.risk_hours)
            )
            AND rz.risk_level >= 7 -- High risk threshold
    ) INTO in_risk_zone;
    
    IF in_risk_zone THEN
        RETURN true;
    END IF;
    
    -- Check for recent high-priority alerts within 1km
    SELECT COUNT(*)
    INTO recent_alerts
    FROM sos_events
    WHERE 
        status IN ('triggered', 'acknowledged', 'responding')
        AND priority IN ('critical', 'high')
        AND ST_DWithin(
            location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
            1000  -- 1km radius
        )
        AND created_at > NOW() - INTERVAL '2 hours';
    
    RETURN recent_alerts >= 3;  -- 3+ alerts = danger zone
END;
$$ LANGUAGE plpgsql;

-- Get alerts within radius
CREATE OR REPLACE FUNCTION get_alerts_in_radius(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 10000
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    status TEXT,
    priority TEXT,
    user_name TEXT,
    location GEOGRAPHY,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.id,
        'sos'::TEXT as type,
        se.status,
        se.priority,
        se.user_name,
        se.location,
        se.address,
        se.created_at,
        ST_Distance(
            se.location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')
        ) as distance
    FROM sos_events se
    WHERE 
        ST_DWithin(
            se.location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
            radius_meters
        )
        AND se.status IN ('triggered', 'acknowledged', 'responding')
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Get safety heatmap data
CREATE OR REPLACE FUNCTION get_safety_heatmap(
    min_lat DOUBLE PRECISION,
    min_lng DOUBLE PRECISION,
    max_lat DOUBLE PRECISION,
    max_lng DOUBLE PRECISION,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    alert_count INTEGER,
    severity_score DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude,
        COUNT(*)::INTEGER as alert_count,
        AVG(
            CASE priority
                WHEN 'critical' THEN 4.0
                WHEN 'high' THEN 3.0
                WHEN 'medium' THEN 2.0
                WHEN 'low' THEN 1.0
            END
        ) as severity_score
    FROM sos_events
    WHERE 
        created_at > NOW() - (days_back || ' days')::INTERVAL
        AND ST_Within(
            location::geometry,
            ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
        )
    GROUP BY location
    HAVING COUNT(*) > 0
    ORDER BY alert_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAFETY SCORE CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_safety_score(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    time_of_day INTEGER DEFAULT NULL,  -- 0-23, NULL = current hour
    crowd_density INTEGER DEFAULT 50,  -- 0-100
    network_quality INTEGER DEFAULT 100 -- 0-100
)
RETURNS JSON AS $$
DECLARE
    location_safety INTEGER := 100;
    time_safety INTEGER := 100;
    crowd_safety INTEGER := 100;
    network_safety INTEGER := 100;
    nearby_alerts INTEGER;
    in_safe_zone BOOLEAN;
    in_danger_zone BOOLEAN;
    final_score INTEGER;
    safety_level TEXT;
    current_hour INTEGER;
BEGIN
    -- Use current hour if not specified
    current_hour := COALESCE(time_of_day, EXTRACT(HOUR FROM NOW())::INTEGER);
    
    -- Check nearby alerts (last 24 hours, within 2km)
    SELECT COUNT(*)
    INTO nearby_alerts
    FROM sos_events
    WHERE 
        ST_DWithin(
            location,
            ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
            2000  -- 2km radius
        )
        AND created_at > NOW() - INTERVAL '24 hours'
        AND status IN ('triggered', 'acknowledged', 'responding');
    
    -- Reduce score based on nearby alerts
    location_safety := location_safety - (nearby_alerts * 15);
    
    -- Check if in safe zone
    SELECT is_in_safe_zone(user_lat, user_lng) INTO in_safe_zone;
    IF in_safe_zone THEN
        location_safety := LEAST(100, location_safety + 15);
    END IF;
    
    -- Check if in danger zone
    SELECT is_in_danger_zone(user_lat, user_lng) INTO in_danger_zone;
    IF in_danger_zone THEN
        location_safety := location_safety - 30;
    END IF;
    
    -- Time of day factor
    IF current_hour >= 22 OR current_hour <= 5 THEN
        time_safety := 50;  -- Night time (10 PM - 5 AM)
    ELSIF current_hour >= 6 AND current_hour <= 9 THEN
        time_safety := 85;  -- Early morning
    ELSIF current_hour >= 18 AND current_hour <= 21 THEN
        time_safety := 75;  -- Evening
    ELSE
        time_safety := 100; -- Daytime
    END IF;
    
    -- Crowd density factor (higher crowd = safer in tourist areas)
    crowd_safety := crowd_density;
    
    -- Network quality factor
    network_safety := network_quality;
    
    -- Clamp all factors
    location_safety := GREATEST(0, LEAST(100, location_safety));
    time_safety := GREATEST(0, LEAST(100, time_safety));
    crowd_safety := GREATEST(0, LEAST(100, crowd_safety));
    network_safety := GREATEST(0, LEAST(100, network_safety));
    
    -- Calculate weighted final score
    final_score := (
        (location_safety * 40) +
        (time_safety * 25) +
        (crowd_safety * 20) +
        (network_safety * 15)
    ) / 100;
    
    -- Determine safety level
    IF final_score >= 80 THEN
        safety_level := 'excellent';
    ELSIF final_score >= 60 THEN
        safety_level := 'good';
    ELSIF final_score >= 40 THEN
        safety_level := 'moderate';
    ELSIF final_score >= 20 THEN
        safety_level := 'low';
    ELSE
        safety_level := 'critical';
    END IF;
    
    -- Return JSON with all details
    RETURN json_build_object(
        'score', final_score,
        'level', safety_level,
        'factors', json_build_object(
            'location_safety', location_safety,
            'time_of_day', time_safety,
            'crowd_density', crowd_safety,
            'network_connectivity', network_safety
        ),
        'alerts', json_build_object(
            'nearby_count', nearby_alerts,
            'in_safe_zone', in_safe_zone,
            'in_danger_zone', in_danger_zone
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POLICE DASHBOARD STATISTICS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_police_dashboard_stats(
    officer_jurisdiction TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'active_sos', (
            SELECT COUNT(*)
            FROM sos_events
            WHERE status IN ('triggered', 'acknowledged', 'responding')
        ),
        'resolved_today', (
            SELECT COUNT(*)
            FROM sos_events
            WHERE status = 'resolved'
            AND DATE(resolution_time) = CURRENT_DATE
        ),
        'average_response_time_minutes', (
            SELECT ROUND(EXTRACT(EPOCH FROM AVG(response_time - created_at)) / 60, 2)
            FROM sos_events
            WHERE response_time IS NOT NULL
            AND created_at > NOW() - INTERVAL '7 days'
        ),
        'active_users', (
            SELECT COUNT(DISTINCT user_id)
            FROM live_locations
            WHERE updated_at > NOW() - INTERVAL '15 minutes'
            AND is_stale = false
        ),
        'critical_alerts', (
            SELECT COUNT(*)
            FROM sos_events
            WHERE priority = 'critical'
            AND status IN ('triggered', 'acknowledged', 'responding')
        ),
        'pending_efir', (
            SELECT COUNT(*)
            FROM efir_reports
            WHERE status IN ('submitted', 'under_review')
        ),
        'danger_zones', (
            SELECT COUNT(*)
            FROM risk_zones
            WHERE is_active = true
            AND risk_level >= 7
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTO-GENERATE FIR NUMBER
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_fir_number()
RETURNS TRIGGER AS $$
DECLARE
    year_code TEXT;
    sequence_num INTEGER;
    fir_num TEXT;
BEGIN
    -- Only generate if status is 'submitted' and fir_number is NULL
    IF NEW.status = 'submitted' AND NEW.fir_number IS NULL THEN
        year_code := TO_CHAR(NOW(), 'YY');
        
        -- Get next sequence number for this year
        SELECT COUNT(*) + 1
        INTO sequence_num
        FROM efir_reports
        WHERE fir_number LIKE 'FIR' || year_code || '%';
        
        -- Format: FIR{YY}{NNNNNN} (e.g., FIR26000001)
        fir_num := 'FIR' || year_code || LPAD(sequence_num::TEXT, 6, '0');
        
        NEW.fir_number := fir_num;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_fir_number_trigger
    BEFORE INSERT OR UPDATE ON efir_reports
    FOR EACH ROW
    EXECUTE FUNCTION generate_fir_number();

-- ============================================================================
-- AUDIT LOG TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_data)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to critical tables
CREATE TRIGGER audit_sos_events
    AFTER INSERT OR UPDATE OR DELETE ON sos_events
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_efir_reports
    AFTER INSERT OR UPDATE OR DELETE ON efir_reports
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_profiles
    AFTER UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- ============================================================================
-- NOTIFICATION TRIGGER (for SOS events)
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_family_on_sos()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notifications for all family members
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT 
        fl.parent_id,
        'sos_alert',
        'Emergency Alert',
        NEW.user_name || ' has triggered an SOS alert!',
        json_build_object(
            'sos_id', NEW.id,
            'user_id', NEW.user_id,
            'location', ST_AsGeoJSON(NEW.location)::json,
            'priority', NEW.priority
        )
    FROM family_links fl
    WHERE fl.child_id = NEW.user_id
    AND fl.can_receive_alerts = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_family_on_sos_trigger
    AFTER INSERT ON sos_events
    FOR EACH ROW
    WHEN (NEW.status = 'triggered')
    EXECUTE FUNCTION notify_family_on_sos();
