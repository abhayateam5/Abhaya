-- Additional PostgreSQL functions for geospatial queries
-- Run this after the initial schema migration

-- ============================================================================
-- FUNCTION: Find nearby safe zones
-- ============================================================================
CREATE OR REPLACE FUNCTION find_nearby_safe_zones(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    location GEOGRAPHY,
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
        sz.location,
        sz.radius,
        sz.address,
        sz.safety_rating,
        ST_Distance(
            sz.location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')
        ) as distance
    FROM safe_zones sz
    WHERE ST_DWithin(
        sz.location,
        ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
        radius_meters
    )
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Find nearest police station
-- ============================================================================
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
        ST_Distance(
            ps.location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')
        ) as distance
    FROM police_stations ps
    ORDER BY distance ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Check if location is in a safe zone
-- ============================================================================
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
        WHERE ST_DWithin(
            sz.location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
            sz.radius
        )
    ) INTO in_zone;
    
    RETURN in_zone;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Check if location is in a danger zone
-- ============================================================================
CREATE OR REPLACE FUNCTION is_in_danger_zone(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION
)
RETURNS BOOLEAN AS $$
DECLARE
    recent_alerts INTEGER;
BEGIN
    -- Check if there are recent high-priority alerts within 1km
    SELECT COUNT(*)
    INTO recent_alerts
    FROM alerts
    WHERE 
        status IN ('active', 'responding')
        AND priority IN ('critical', 'high')
        AND ST_DWithin(
            location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
            1000  -- 1km radius
        )
        AND created_at > NOW() - INTERVAL '2 hours';
    
    RETURN recent_alerts > 2;  -- More than 2 alerts = danger zone
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get alerts within radius
-- ============================================================================
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
    tourist_name TEXT,
    location GEOGRAPHY,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.type,
        a.status,
        a.priority,
        a.tourist_name,
        a.location,
        a.address,
        a.created_at,
        ST_Distance(
            a.location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')
        ) as distance
    FROM alerts a
    WHERE 
        ST_DWithin(
            a.location,
            ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
            radius_meters
        )
        AND a.status IN ('active', 'responding')
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get safety heatmap data
-- ============================================================================
CREATE OR REPLACE FUNCTION get_safety_heatmap(
    min_lat DOUBLE PRECISION,
    min_lng DOUBLE PRECISION,
    max_lat DOUBLE PRECISION,
    max_lng DOUBLE PRECISION
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
    FROM alerts
    WHERE 
        created_at > NOW() - INTERVAL '30 days'
        AND ST_Within(
            location::geometry,
            ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
        )
    GROUP BY location
    HAVING COUNT(*) > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Calculate user safety score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_safety_score(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    time_of_day INTEGER,  -- 0-23
    crowd_density INTEGER  -- 0-100
)
RETURNS INTEGER AS $$
DECLARE
    location_safety INTEGER := 100;
    time_safety INTEGER := 100;
    nearby_alerts INTEGER;
    in_safe_zone BOOLEAN;
    final_score INTEGER;
BEGIN
    -- Check nearby alerts (last 24 hours)
    SELECT COUNT(*)
    INTO nearby_alerts
    FROM alerts
    WHERE 
        ST_DWithin(
            location,
            ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
            2000  -- 2km radius
        )
        AND created_at > NOW() - INTERVAL '24 hours'
        AND status IN ('active', 'responding');
    
    -- Reduce score based on nearby alerts
    location_safety := location_safety - (nearby_alerts * 10);
    
    -- Check if in safe zone
    SELECT is_in_safe_zone(user_lat, user_lng) INTO in_safe_zone;
    IF in_safe_zone THEN
        location_safety := location_safety + 10;
    END IF;
    
    -- Time of day factor (night = less safe)
    IF time_of_day >= 22 OR time_of_day <= 5 THEN
        time_safety := 60;  -- Night time
    ELSIF time_of_day >= 6 AND time_of_day <= 9 THEN
        time_safety := 90;  -- Morning
    ELSIF time_of_day >= 18 AND time_of_day <= 21 THEN
        time_safety := 80;  -- Evening
    ELSE
        time_safety := 100; -- Daytime
    END IF;
    
    -- Calculate final score (weighted average)
    final_score := (
        (location_safety * 40) +
        (time_safety * 30) +
        (crowd_density * 20) +
        (100 * 10)  -- Network connectivity (assume 100 for now)
    ) / 100;
    
    -- Clamp between 0 and 100
    final_score := GREATEST(0, LEAST(100, final_score));
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get police dashboard statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION get_police_dashboard_stats(
    officer_jurisdiction TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'active_alerts', (
            SELECT COUNT(*)
            FROM alerts
            WHERE status IN ('active', 'responding')
        ),
        'resolved_today', (
            SELECT COUNT(*)
            FROM alerts
            WHERE status = 'resolved'
            AND DATE(resolution_time) = CURRENT_DATE
        ),
        'average_response_time', (
            SELECT EXTRACT(EPOCH FROM AVG(response_time - created_at)) / 60
            FROM alerts
            WHERE response_time IS NOT NULL
            AND created_at > NOW() - INTERVAL '7 days'
        ),
        'tourists_in_jurisdiction', (
            SELECT COUNT(DISTINCT user_id)
            FROM locations
            WHERE timestamp > NOW() - INTERVAL '1 hour'
            AND user_type = 'tourist'
        ),
        'critical_alerts', (
            SELECT COUNT(*)
            FROM alerts
            WHERE priority = 'critical'
            AND status IN ('active', 'responding')
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;
