// Safety Score Types
export interface SafetyFactors {
    locationSafety: number;      // 0-100, weight: 25%
    timeOfDay: number;           // 0-100, weight: 20%
    crowdDensity: number;        // 0-100, weight: 15%
    weatherConditions: number;   // 0-100, weight: 15%
    networkConnectivity: number; // 0-100, weight: 10%
    routeCompliance: number;     // 0-100, weight: 15%
}

export interface SafetyScore {
    _id: string;
    userId: string;
    score: number;           // 0-100 composite score
    factors: SafetyFactors;
    level: 'excellent' | 'good' | 'moderate' | 'low' | 'critical';
    timestamp: Date;
}

export interface SafetyScoreHistory {
    scores: SafetyScore[];
    average: number;
    trend: 'improving' | 'stable' | 'declining';
}

// Anomaly Types
export type AnomalyType =
    | 'prolonged_inactivity'
    | 'route_deviation'
    | 'gps_signal_loss'
    | 'rapid_movement'
    | 'network_disconnection'
    | 'low_battery'
    | 'geofence_breach';

export interface Anomaly {
    id: string;
    type: AnomalyType;
    severity: 'low' | 'medium' | 'high';
    message: string;
    detectedAt: Date;
    resolved: boolean;
    resolvedAt?: Date;
}
