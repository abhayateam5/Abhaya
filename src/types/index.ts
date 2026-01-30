// Export all types from a single entry point
export * from './user.types';
export * from './alert.types';
export * from './location.types';
export * from './safety.types';

// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Family Types
export interface FamilyMember {
    userId: string;
    name: string;
    phone: string;
    photo?: string;
    role: 'admin' | 'member';
    lastLocation?: {
        latitude: number;
        longitude: number;
        timestamp: Date;
    };
    safetyScore?: number;
    isOnline: boolean;
}

export interface FamilyGroup {
    _id: string;
    name: string;
    code: string;  // Unique join code
    members: FamilyMember[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Itinerary Types
export interface Itinerary {
    _id: string;
    userId: string;
    title: string;
    destinations: ItineraryDestination[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ItineraryDestination {
    id: string;
    name: string;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    arrivalDate: Date;
    departureDate: Date;
    notes?: string;
    checkpoints?: ItineraryCheckpoint[];
}

export interface ItineraryCheckpoint {
    id: string;
    time: Date;
    status: 'pending' | 'checked_in' | 'missed';
    notes?: string;
}

// Reward Types
export interface RewardToken {
    userId: string;
    balance: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    earnedTotal: number;
    redeemedTotal: number;
}

export interface RewardActivity {
    id: string;
    userId: string;
    type: 'check_in' | 'safe_travel' | 'milestone' | 'referral' | 'bonus';
    tokens: number;
    description: string;
    timestamp: Date;
}

// Police Dashboard Types
export interface HeatmapData {
    zones: HeatmapZone[];
    lastUpdated: Date;
}

export interface HeatmapZone {
    id: string;
    name: string;
    center: {
        latitude: number;
        longitude: number;
    };
    radius: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    touristCount: number;
    incidentCount: number;
    patrolCount: number;
}

export interface DashboardStats {
    totalTourists: number;
    activeSOS: number;
    activePatrols: number;
    averageSafetyScore: number;
    incidentsToday: number;
    highRiskZones: number;
}
