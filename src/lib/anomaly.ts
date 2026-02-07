/**
 * Anomaly Detection Service
 * Detects unusual patterns and triggers alerts/SOS
 */

import { calculateDistance, Point } from './geofence';

export interface AnomalyResult {
    detected: boolean;
    type?: AnomalyType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    shouldTriggerSOS: boolean;
    metadata?: any;
}

export type AnomalyType =
    | 'inactivity'
    | 'route_deviation'
    | 'speed_anomaly'
    | 'gps_loss'
    | 'unusual_hours'
    | 'battery_drain'
    | 'missed_checkpoint';

/**
 * Detect inactivity (no activity for threshold minutes)
 */
export function detectInactivity(
    lastActivityTime: Date,
    thresholdMinutes: number = 30
): AnomalyResult {
    const minutesInactive = (Date.now() - lastActivityTime.getTime()) / 60000;

    if (minutesInactive < thresholdMinutes) {
        return {
            detected: false,
            severity: 'low',
            description: 'Activity normal',
            shouldTriggerSOS: false,
        };
    }

    const severity: 'medium' | 'high' | 'critical' =
        minutesInactive > 60 ? 'critical' : minutesInactive > 45 ? 'high' : 'medium';

    return {
        detected: true,
        type: 'inactivity',
        severity,
        description: `No activity for ${Math.floor(minutesInactive)} minutes`,
        shouldTriggerSOS: severity === 'critical',
        metadata: { minutes_inactive: Math.floor(minutesInactive) },
    };
}

/**
 * Detect route deviation (distance from planned route)
 */
export function detectRouteDeviation(
    currentLocation: Point,
    plannedRoute: Point[],
    thresholdMeters: number = 2000
): AnomalyResult {
    if (plannedRoute.length === 0) {
        return {
            detected: false,
            severity: 'low',
            description: 'No route to compare',
            shouldTriggerSOS: false,
        };
    }

    // Find closest point on route
    let minDistance = Infinity;
    for (const point of plannedRoute) {
        const distance = calculateDistance(currentLocation, point);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }

    if (minDistance < thresholdMeters) {
        return {
            detected: false,
            severity: 'low',
            description: 'On route',
            shouldTriggerSOS: false,
        };
    }

    const severity: 'medium' | 'high' | 'critical' =
        minDistance > 5000 ? 'critical' : minDistance > 3000 ? 'high' : 'medium';

    return {
        detected: true,
        type: 'route_deviation',
        severity,
        description: `${(minDistance / 1000).toFixed(1)}km off planned route`,
        shouldTriggerSOS: severity === 'critical',
        metadata: { deviation_meters: Math.floor(minDistance) },
    };
}

/**
 * Detect speed anomaly
 */
export function detectSpeedAnomaly(
    currentSpeed: number, // km/h
    travelMode: 'walking' | 'driving' | 'public_transport' = 'walking'
): AnomalyResult {
    const speedLimits = {
        walking: { min: 0, max: 8, critical: 15 },
        driving: { min: 0, max: 120, critical: 150 },
        public_transport: { min: 0, max: 100, critical: 130 },
    };

    const limits = speedLimits[travelMode];

    if (currentSpeed <= limits.max) {
        return {
            detected: false,
            severity: 'low',
            description: 'Speed normal',
            shouldTriggerSOS: false,
        };
    }

    const severity: 'medium' | 'high' | 'critical' =
        currentSpeed > limits.critical ? 'critical' : currentSpeed > limits.max * 1.2 ? 'high' : 'medium';

    return {
        detected: true,
        type: 'speed_anomaly',
        severity,
        description: `Unusual speed: ${currentSpeed.toFixed(0)}km/h for ${travelMode}`,
        shouldTriggerSOS: severity === 'critical',
        metadata: { speed_kmh: currentSpeed, mode: travelMode },
    };
}

/**
 * Detect GPS signal loss
 */
export function detectGPSLoss(
    lastGPSUpdate: Date,
    thresholdMinutes: number = 5
): AnomalyResult {
    const minutesSinceLast = (Date.now() - lastGPSUpdate.getTime()) / 60000;

    if (minutesSinceLast < thresholdMinutes) {
        return {
            detected: false,
            severity: 'low',
            description: 'GPS signal normal',
            shouldTriggerSOS: false,
        };
    }

    const severity: 'medium' | 'high' | 'critical' =
        minutesSinceLast > 15 ? 'critical' : minutesSinceLast > 10 ? 'high' : 'medium';

    return {
        detected: true,
        type: 'gps_loss',
        severity,
        description: `GPS signal lost for ${Math.floor(minutesSinceLast)} minutes`,
        shouldTriggerSOS: severity === 'critical',
        metadata: { minutes_since_gps: Math.floor(minutesSinceLast) },
    };
}

/**
 * Detect unusual hours (2-5 AM activity)
 */
export function detectUnusualHours(currentTime: Date = new Date()): AnomalyResult {
    const hour = currentTime.getHours();

    // 2 AM - 5 AM is considered unusual
    if (hour >= 2 && hour < 5) {
        return {
            detected: true,
            type: 'unusual_hours',
            severity: 'medium',
            description: `Activity at unusual hour: ${hour}:00`,
            shouldTriggerSOS: false,
            metadata: { hour },
        };
    }

    return {
        detected: false,
        severity: 'low',
        description: 'Normal hours',
        shouldTriggerSOS: false,
    };
}

/**
 * Detect battery drain
 */
export function detectBatteryDrain(batteryLevel: number): AnomalyResult {
    if (batteryLevel > 20) {
        return {
            detected: false,
            severity: 'low',
            description: 'Battery level normal',
            shouldTriggerSOS: false,
        };
    }

    const severity: 'medium' | 'high' | 'critical' =
        batteryLevel <= 5 ? 'critical' : batteryLevel <= 10 ? 'high' : 'medium';

    return {
        detected: true,
        type: 'battery_drain',
        severity,
        description: `Low battery: ${batteryLevel}%`,
        shouldTriggerSOS: false, // Don't auto-trigger SOS for battery
        metadata: { battery_level: batteryLevel },
    };
}

/**
 * Run all anomaly checks
 */
export function detectAllAnomalies(data: {
    lastActivity?: Date;
    currentLocation?: Point;
    plannedRoute?: Point[];
    speed?: number;
    travelMode?: 'walking' | 'driving' | 'public_transport';
    lastGPSUpdate?: Date;
    batteryLevel?: number;
}): AnomalyResult[] {
    const anomalies: AnomalyResult[] = [];

    if (data.lastActivity) {
        const inactivity = detectInactivity(data.lastActivity);
        if (inactivity.detected) anomalies.push(inactivity);
    }

    if (data.currentLocation && data.plannedRoute) {
        const deviation = detectRouteDeviation(data.currentLocation, data.plannedRoute);
        if (deviation.detected) anomalies.push(deviation);
    }

    if (data.speed !== undefined) {
        const speedAnomaly = detectSpeedAnomaly(data.speed, data.travelMode);
        if (speedAnomaly.detected) anomalies.push(speedAnomaly);
    }

    if (data.lastGPSUpdate) {
        const gpsLoss = detectGPSLoss(data.lastGPSUpdate);
        if (gpsLoss.detected) anomalies.push(gpsLoss);
    }

    if (data.batteryLevel !== undefined) {
        const battery = detectBatteryDrain(data.batteryLevel);
        if (battery.detected) anomalies.push(battery);
    }

    const unusualHours = detectUnusualHours();
    if (unusualHours.detected) anomalies.push(unusualHours);

    return anomalies;
}

/**
 * Determine if any anomaly should trigger SOS
 */
export function shouldTriggerAutoSOS(anomalies: AnomalyResult[]): boolean {
    return anomalies.some((a) => a.shouldTriggerSOS);
}
