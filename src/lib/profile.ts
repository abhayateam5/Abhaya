/**
 * ABHAYA Profile Management
 * User profile utilities and validation
 */

import { supabase } from './supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'parent' | 'child' | 'police' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'blocked' | 'deleted';

export interface EmergencyContact {
    name: string;
    phone: string;
    relationship: string;
    is_primary: boolean;
}

export interface Profile {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    photo?: string;
    nationality?: string;
    passport_number?: string;
    aadhar_number?: string;
    emergency_contacts: EmergencyContact[];
    safety_score: number;
    badge_number?: string;
    department?: string;
    rank?: string;
    jurisdiction?: string;
    is_verified: boolean;
    verified_at?: string;
    last_active: string;
    created_at: string;
    updated_at: string;
}

export interface CreateProfileParams {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    emergency_contacts?: EmergencyContact[];
    nationality?: string;
    passport_number?: string;
    aadhar_number?: string;
    photo?: string;
}

export interface UpdateProfileParams {
    name?: string;
    phone?: string;
    photo?: string;
    nationality?: string;
    passport_number?: string;
    aadhar_number?: string;
    emergency_contacts?: EmergencyContact[];
    badge_number?: string;
    department?: string;
    rank?: string;
    jurisdiction?: string;
}

// ============================================================================
// PROFILE CRUD OPERATIONS
// ============================================================================

/**
 * Get user profile by ID
 * @param userId User ID
 * @returns Profile or error
 */
export async function getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception fetching profile:', error);
        return { data: null, error };
    }
}

/**
 * Get current user's profile
 * @returns Profile or error
 */
export async function getCurrentProfile(): Promise<{ data: Profile | null; error: any }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        return getProfile(user.id);
    } catch (error) {
        console.error('Exception fetching current profile:', error);
        return { data: null, error };
    }
}

/**
 * Create user profile
 * @param params Profile creation parameters
 * @returns Created profile or error
 */
export async function createProfile(params: CreateProfileParams): Promise<{ data: Profile | null; error: any }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const profileData = {
            id: user.id,
            name: params.name,
            email: params.email,
            phone: params.phone,
            role: params.role,
            emergency_contacts: params.emergency_contacts || [],
            nationality: params.nationality,
            passport_number: params.passport_number,
            aadhar_number: params.aadhar_number,
            photo: params.photo,
        };

        const { data, error } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception creating profile:', error);
        return { data: null, error };
    }
}

/**
 * Update user profile
 * @param userId User ID
 * @param params Update parameters
 * @returns Updated profile or error
 */
export async function updateProfile(
    userId: string,
    params: UpdateProfileParams
): Promise<{ data: Profile | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...params,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception updating profile:', error);
        return { data: null, error };
    }
}

// ============================================================================
// PROFILE COMPLETION
// ============================================================================

/**
 * Get required fields based on user role
 * @param role User role
 * @returns Array of required field names
 */
export function getRequiredFields(role: UserRole): string[] {
    const baseFields = ['name', 'email', 'phone', 'emergency_contacts'];

    switch (role) {
        case 'parent':
        case 'child':
            return [...baseFields, 'nationality'];
        case 'police':
            return [...baseFields, 'badge_number', 'department', 'rank', 'jurisdiction'];
        case 'admin':
            return baseFields;
        default:
            return baseFields;
    }
}

/**
 * Check if profile is complete
 * @param profile User profile
 * @returns True if profile is complete
 */
export function isProfileComplete(profile: Partial<Profile>): boolean {
    if (!profile.role) return false;

    const requiredFields = getRequiredFields(profile.role);

    for (const field of requiredFields) {
        const value = profile[field as keyof Profile];

        // Check if field exists and is not empty
        if (!value) return false;

        // Special check for emergency_contacts (must have at least 2)
        if (field === 'emergency_contacts') {
            const contacts = value as EmergencyContact[];
            if (!Array.isArray(contacts) || contacts.length < 2) return false;
        }
    }

    return true;
}

/**
 * Get missing fields for profile completion
 * @param profile User profile
 * @returns Array of missing field names
 */
export function getMissingFields(profile: Partial<Profile>): string[] {
    if (!profile.role) return ['role'];

    const requiredFields = getRequiredFields(profile.role);
    const missing: string[] = [];

    for (const field of requiredFields) {
        const value = profile[field as keyof Profile];

        if (!value) {
            missing.push(field);
            continue;
        }

        // Special check for emergency_contacts
        if (field === 'emergency_contacts') {
            const contacts = value as EmergencyContact[];
            if (!Array.isArray(contacts) || contacts.length < 2) {
                missing.push('emergency_contacts (minimum 2 required)');
            }
        }
    }

    return missing;
}

/**
 * Calculate profile completion percentage
 * @param profile User profile
 * @returns Completion percentage (0-100)
 */
export function getProfileCompletionPercentage(profile: Partial<Profile>): number {
    if (!profile.role) return 0;

    const requiredFields = getRequiredFields(profile.role);
    let completedFields = 0;

    for (const field of requiredFields) {
        const value = profile[field as keyof Profile];

        if (value) {
            // Special check for emergency_contacts
            if (field === 'emergency_contacts') {
                const contacts = value as EmergencyContact[];
                if (Array.isArray(contacts) && contacts.length >= 2) {
                    completedFields++;
                }
            } else {
                completedFields++;
            }
        }
    }

    return Math.round((completedFields / requiredFields.length) * 100);
}

// ============================================================================
// EMERGENCY CONTACTS VALIDATION
// ============================================================================

/**
 * Validate emergency contacts
 * @param contacts Emergency contacts array
 * @returns Validation result
 */
export function validateEmergencyContacts(contacts: EmergencyContact[]): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Must have at least 2 contacts
    if (!Array.isArray(contacts) || contacts.length < 2) {
        errors.push('Minimum 2 emergency contacts required');
        return { valid: false, errors };
    }

    // Must have exactly one primary contact
    const primaryContacts = contacts.filter((c) => c.is_primary);
    if (primaryContacts.length === 0) {
        errors.push('One contact must be marked as primary');
    } else if (primaryContacts.length > 1) {
        errors.push('Only one contact can be marked as primary');
    }

    // Validate each contact
    contacts.forEach((contact, index) => {
        if (!contact.name || contact.name.trim() === '') {
            errors.push(`Contact ${index + 1}: Name is required`);
        }

        if (!contact.phone || contact.phone.trim() === '') {
            errors.push(`Contact ${index + 1}: Phone is required`);
        } else if (!/^\+?[\d\s-()]+$/.test(contact.phone)) {
            errors.push(`Contact ${index + 1}: Invalid phone format`);
        }

        if (!contact.relationship || contact.relationship.trim() === '') {
            errors.push(`Contact ${index + 1}: Relationship is required`);
        }
    });

    return { valid: errors.length === 0, errors };
}

/**
 * Upload profile photo to Supabase Storage
 * @param userId User ID
 * @param file Photo file
 * @returns Public URL or error
 */
export async function uploadProfilePhoto(
    userId: string,
    file: File
): Promise<{ url: string | null; error: any }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Error uploading photo:', uploadError);
            return { url: null, error: uploadError };
        }

        const { data } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);

        return { url: data.publicUrl, error: null };
    } catch (error) {
        console.error('Exception uploading photo:', error);
        return { url: null, error };
    }
}
