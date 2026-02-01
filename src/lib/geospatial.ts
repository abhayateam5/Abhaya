import { supabase } from './supabase/client';

/**
 * Geospatial utility functions using PostGIS
 */

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface SafeZone {
    id: string;
    name: string;
    type: string;
    location: string;
    radius: number;
    address: string | null;
    safety_rating: number | null;
    distance?: number;
}

export interface PoliceStation {
    id: string;
    name: string;
    location: string;
    address: string;
    phone: string;
    distance?: number;
}

/**
 * Convert coordinates to PostGIS POINT format
 */
export function toPostGISPoint(lat: number, lng: number): string {
    return `POINT(${lng} ${lat})`;
}

/**
 * Parse PostGIS POINT to coordinates
 */
export function fromPostGISPoint(point: string): Coordinates {
    // Format: "POINT(lng lat)" or GeoJSON
    if (point.startsWith('POINT')) {
        const match = point.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (match) {
            return {
                longitude: parseFloat(match[1]),
                latitude: parseFloat(match[2]),
            };
        }
    }

    // Try parsing as GeoJSON
    try {
        const geojson = JSON.parse(point);
        if (geojson.type === 'Point') {
            return {
                longitude: geojson.coordinates[0],
                latitude: geojson.coordinates[1],
            };
        }
    } catch (e) {
        // Not JSON
    }

    throw new Error('Invalid PostGIS point format');
}

/**
 * Find safe zones within a radius (in meters)
 */
export async function findNearbySafeZones(
    lat: number,
    lng: number,
    radiusMeters: number = 5000
): Promise<SafeZone[]> {
    // supabase is already imported at the top

    const { data, error } = await supabase.rpc('find_nearby_safe_zones', {
        lat,
        lng,
        radius_meters: radiusMeters,
    });

    if (error) {
        console.error('Error finding safe zones:', error);
        return [];
    }

    return data || [];
}

/**
 * Find the nearest police station
 */
export async function findNearestPoliceStation(
    lat: number,
    lng: number
): Promise<PoliceStation | null> {
    // supabase is already imported at the top

    const { data, error } = await supabase.rpc('find_nearest_police_station', {
        lat,
        lng,
    });

    if (error) {
        console.error('Error finding police station:', error);
        return null;
    }

    return data?.[0] || null;
}

/**
 * Check if coordinates are in a safe zone
 */
export async function isInSafeZone(
    lat: number,
    lng: number
): Promise<boolean> {
    // supabase is already imported at the top

    const { data, error } = await supabase.rpc('is_in_safe_zone', {
        lat,
        lng,
    });

    if (error) {
        console.error('Error checking safe zone:', error);
        return false;
    }

    return data || false;
}

/**
 * Check if coordinates are in a danger zone
 */
export async function isInDangerZone(
    lat: number,
    lng: number
): Promise<boolean> {
    // supabase is already imported at the top

    const { data, error } = await supabase.rpc('is_in_danger_zone', {
        lat,
        lng,
    });

    if (error) {
        console.error('Error checking danger zone:', error);
        return false;
    }

    return data || false;
}

/**
 * Calculate distance between two points (in meters)
 */
export function calculateDistance(
    point1: Coordinates,
    point2: Coordinates
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Get all alerts within a radius
 */
export async function getAlertsInRadius(
    lat: number,
    lng: number,
    radiusMeters: number = 10000
) {
    // supabase is already imported at the top

    const { data, error } = await supabase.rpc('get_alerts_in_radius', {
        lat,
        lng,
        radius_meters: radiusMeters,
    });

    if (error) {
        console.error('Error getting alerts:', error);
        return [];
    }

    return data || [];
}

/**
 * Check if user has deviated from itinerary route
 */
export async function checkRouteDeviation(
    userId: string,
    currentLat: number,
    currentLng: number,
    thresholdMeters: number = 1000
): Promise<boolean> {
    // supabase is already imported at the top

    // Get active itinerary
    const { data: itinerary } = await supabase
        .from('itineraries')
        .select(`
      *,
      destinations (
        id,
        name,
        location,
        arrival_date,
        departure_date
      )
    `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (!itinerary || !itinerary.destinations?.length) {
        return false;
    }

    // Check if current location is near any destination
    for (const dest of itinerary.destinations) {
        const destCoords = fromPostGISPoint(dest.location);
        const distance = calculateDistance(
            { latitude: currentLat, longitude: currentLng },
            destCoords
        );

        if (distance <= thresholdMeters) {
            return false; // Within threshold, no deviation
        }
    }

    return true; // Deviated from all destinations
}
