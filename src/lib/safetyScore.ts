/**
 * Safety Score v2 Service
 * Calculates composite safety score based on weighted factors
 */

export interface SafetyScoreBreakdown {
    composite: number;
    location: number;
    timeOfDay: number;
    recentIncidents: number;
    userBehavior: number;
    battery: number;
}

export interface Location {
    lat: number;
    lng: number;
}

/**
 * Calculate composite safety score
 * @param userId - User ID
 * @param location - Current location
 * @param batteryLevel - Battery percentage (0-100)
 * @returns Safety score breakdown
 */
export async function calculateSafetyScore(
    userId: string,
    location: Location,
    batteryLevel: number
): Promise<SafetyScoreBreakdown> {
    // Calculate individual scores
    const locationScore = await getLocationScore(location);
    const timeScore = getTimeOfDayScore();
    const incidentScore = await getRecentIncidentsScore(location);
    const behaviorScore = await getUserBehaviorScore(userId);
    const batteryScore = getBatteryScore(batteryLevel);

    // Calculate weighted composite score
    const composite = Math.round(
        locationScore * 0.40 +
        timeScore * 0.15 +
        incidentScore * 0.20 +
        behaviorScore * 0.15 +
        batteryScore * 0.10
    );

    return {
        composite,
        location: locationScore,
        timeOfDay: timeScore,
        recentIncidents: incidentScore,
        userBehavior: behaviorScore,
        battery: batteryScore,
    };
}

/**
 * Get time of day safety score
 * @returns Score 0-100
 */
export function getTimeOfDayScore(): number {
    const hour = new Date().getHours();

    // Daytime (6 AM - 6 PM): 100
    if (hour >= 6 && hour < 18) {
        return 100;
    }
    // Evening (6 PM - 10 PM): 75
    else if (hour >= 18 && hour < 22) {
        return 75;
    }
    // Late night (10 PM - 2 AM): 50
    else if (hour >= 22 || hour < 2) {
        return 50;
    }
    // Early morning (2 AM - 6 AM): 25
    else {
        return 25;
    }
}

/**
 * Get location-based safety score
 * Uses database function to query nearby location safety scores
 * @param location - Location coordinates
 * @returns Score 0-100
 */
export async function getLocationScore(location: Location): Promise<number> {
    // This will be called via API endpoint which uses Supabase RPC
    // For now, return a default score
    // The actual implementation will use: supabase.rpc('get_location_safety_score', { p_lat, p_lng })
    return 75; // Default medium-safe score
}

/**
 * Get recent incidents score
 * Uses database function to count nearby incidents
 * @param location - Location coordinates
 * @returns Score 0-100
 */
export async function getRecentIncidentsScore(location: Location): Promise<number> {
    // This will be called via API endpoint which uses Supabase RPC
    // For now, return a default score
    // The actual implementation will use: supabase.rpc('get_recent_incidents_score', { p_lat, p_lng })
    return 90; // Default low-incident score
}

/**
 * Get user behavior score
 * Uses database function to analyze user's safety behavior
 * @param userId - User ID
 * @returns Score 0-100
 */
export async function getUserBehaviorScore(userId: string): Promise<number> {
    // This will be called via API endpoint which uses Supabase RPC
    // For now, return a default score
    // The actual implementation will use: supabase.rpc('get_user_behavior_score', { p_user_id })
    return 80; // Default good-behavior score
}

/**
 * Get battery level score
 * @param batteryLevel - Battery percentage (0-100)
 * @returns Score 0-100
 */
export function getBatteryScore(batteryLevel: number): number {
    if (batteryLevel > 50) {
        return 100;
    } else if (batteryLevel >= 20) {
        return 70;
    } else if (batteryLevel >= 10) {
        return 40;
    } else {
        return 10;
    }
}

/**
 * Get score color based on value
 * @param score - Score 0-100
 * @returns Tailwind color class
 */
export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
}

/**
 * Get score background color based on value
 * @param score - Score 0-100
 * @returns Tailwind background color class
 */
export function getScoreBgColor(score: number): string {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
}

/**
 * Get score label based on value
 * @param score - Score 0-100
 * @returns Label string
 */
export function getScoreLabel(score: number): string {
    if (score >= 80) return 'Very Safe';
    if (score >= 60) return 'Safe';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Unsafe';
    return 'Very Unsafe';
}

/**
 * Incident types
 */
export const INCIDENT_TYPES = [
    { value: 'theft', label: 'Theft' },
    { value: 'assault', label: 'Assault' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'other', label: 'Other' },
] as const;

/**
 * Incident severity levels
 */
export const INCIDENT_SEVERITY = [
    { value: 'low', label: 'Low', color: 'text-yellow-600' },
    { value: 'medium', label: 'Medium', color: 'text-orange-600' },
    { value: 'high', label: 'High', color: 'text-red-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-800' },
] as const;
