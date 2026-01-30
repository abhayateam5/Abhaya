// User Types
export type UserRole = 'tourist' | 'police' | 'admin';

export interface EmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}

export interface ItineraryItem {
    destination: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
}

export interface User {
    _id: string;
    // Identity
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    photo?: string;

    // Tourist-specific
    nationality?: string;
    passportNumber?: string;
    aadharNumber?: string;
    emergencyContacts?: EmergencyContact[];
    itinerary?: ItineraryItem[];

    // Safety
    safetyScore: number;
    digitalIdHash?: string;
    rfidTag?: string;

    // Police-specific
    badgeNumber?: string;
    department?: string;
    rank?: string;

    // Status
    isActive: boolean;
    isVerified: boolean;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    lastActive: Date;
}

export interface UserSession {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    photo?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    nationality?: string;
    passportNumber?: string;
}
