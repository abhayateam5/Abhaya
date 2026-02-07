/**
 * Geofencing Service
 * Handles zone detection, entry/exit tracking, and distance calculations
 */

export interface Point {
    lat: number;
    lng: number;
}

export interface Zone {
    id: string;
    name: string;
    type: 'safe' | 'risk';
    center_point?: Point;
    radius?: number; // meters
    area?: Point[]; // polygon points
}

export interface ZoneCheckResult {
    inZone: boolean;
    zones: Zone[];
    inSafeZone: boolean;
    inRiskZone: boolean;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(point1: Point, point2: Point): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Check if a point is inside a circle zone
 */
export function isPointInCircle(
    point: Point,
    center: Point,
    radius: number
): boolean {
    const distance = calculateDistance(point, center);
    return distance <= radius;
}

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng,
            yi = polygon[i].lat;
        const xj = polygon[j].lng,
            yj = polygon[j].lat;

        const intersect =
            yi > point.lat !== yj > point.lat &&
            point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Check if a point is in any zone
 */
export function checkZone(location: Point, zones: Zone[]): ZoneCheckResult {
    const matchedZones: Zone[] = [];

    for (const zone of zones) {
        let inZone = false;

        // Check circle zones
        if (zone.center_point && zone.radius) {
            inZone = isPointInCircle(location, zone.center_point, zone.radius);
        }
        // Check polygon zones
        else if (zone.area && zone.area.length > 0) {
            inZone = isPointInPolygon(location, zone.area);
        }

        if (inZone) {
            matchedZones.push(zone);
        }
    }

    return {
        inZone: matchedZones.length > 0,
        zones: matchedZones,
        inSafeZone: matchedZones.some((z) => z.type === 'safe'),
        inRiskZone: matchedZones.some((z) => z.type === 'risk'),
    };
}

/**
 * Detect zone changes (entry/exit) between two locations
 */
export function detectZoneChange(
    prevLocation: Point,
    newLocation: Point,
    zones: Zone[]
): {
    entered: Zone[];
    exited: Zone[];
} {
    const prevCheck = checkZone(prevLocation, zones);
    const newCheck = checkZone(newLocation, zones);

    const prevZoneIds = new Set(prevCheck.zones.map((z) => z.id));
    const newZoneIds = new Set(newCheck.zones.map((z) => z.id));

    const entered = newCheck.zones.filter((z) => !prevZoneIds.has(z.id));
    const exited = prevCheck.zones.filter((z) => !newZoneIds.has(z.id));

    return { entered, exited };
}

/**
 * Get proximity warning distance (500m before entering risk zone)
 */
export function getProximityWarning(
    location: Point,
    riskZones: Zone[]
): { warning: boolean; zone?: Zone; distance?: number } {
    const WARNING_DISTANCE = 500; // meters

    for (const zone of riskZones) {
        if (zone.center_point && zone.radius) {
            const distance = calculateDistance(location, zone.center_point);
            const proximityThreshold = zone.radius + WARNING_DISTANCE;

            if (distance <= proximityThreshold && distance > zone.radius) {
                return {
                    warning: true,
                    zone,
                    distance: distance - zone.radius,
                };
            }
        }
    }

    return { warning: false };
}
