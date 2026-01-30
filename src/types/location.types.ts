// Location Types
export type SafetyLevel = 'safe' | 'caution' | 'danger';
export type UserType = 'tourist' | 'police';

export interface GeoPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface VitalSigns {
    heartRate?: number;
    spO2?: number;
    temperature?: number;
    steps?: number;
}

export interface LocationRecord {
    _id: string;
    userId: string;
    userType: UserType;

    // Position
    location: GeoPoint;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;

    // Safety context
    inSafeZone: boolean;
    currentZone?: string;
    safetyLevel: SafetyLevel;

    // Device info
    deviceId?: string;
    batteryLevel?: number;

    // Vitals (from wristband)
    vitals?: VitalSigns;

    // Timestamp
    timestamp: Date;
}

export interface LocationUpdate {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    batteryLevel?: number;
}

// Geo-fence types
export type ZoneType = 'safe' | 'caution' | 'danger' | 'custom';

export interface GeoZone {
    id: string;
    name: string;
    type: ZoneType;
    center: GeoPoint;
    radius: number; // in meters
    description?: string;
    isActive: boolean;
}
