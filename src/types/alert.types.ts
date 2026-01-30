// Alert Types
export type AlertType = 'sos' | 'geofence' | 'anomaly' | 'health' | 'silent';
export type AlertStatus = 'active' | 'responding' | 'resolved' | 'false_alarm';
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';

export interface GeoLocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface Alert {
    _id: string;
    type: AlertType;
    status: AlertStatus;
    priority: AlertPriority;

    // Tourist info
    touristId: string;
    touristName: string;
    touristPhone: string;

    // Location
    location: GeoLocation;
    address?: string;

    // Details
    description?: string;
    audioEvidence?: string;
    photos?: string[];

    // Response
    respondingOfficerId?: string;
    respondingOfficerName?: string;
    responseTime?: Date;
    resolutionTime?: Date;
    resolutionNotes?: string;

    // Verification
    blockchainHash?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

export interface AlertCreateData {
    type: AlertType;
    priority: AlertPriority;
    touristId: string;
    touristName: string;
    touristPhone: string;
    location: GeoLocation;
    address?: string;
    description?: string;
}
