/**
 * ABHAYA Family Tracking System
 * Manage family relationships, consent, and tracking permissions
 */

import { supabase } from './supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface FamilyLink {
    parent_id: string;
    child_id: string;
    relationship_type: 'parent-child' | 'guardian-ward';
    verified: boolean;
    verified_at?: string;
    can_view_location: boolean;
    can_receive_alerts: boolean;
    status: 'active' | 'pending' | 'expired' | 'revoked';
    tracking_consent_until?: string;
    emergency_override: boolean;
    delegation_type: 'parent-child' | 'guardian-ward' | 'emergency-contact' | 'temporary-guardian';
    last_check_in?: string;
    invite_code?: string;
    invite_expires_at?: string;
    notes?: string;
    created_at: string;
    updated_at?: string;
}

export interface FamilyMember {
    id: string;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    role: string;
    relationship: string;
    can_view_location: boolean;
    status: string;
    last_seen?: string;
    battery_level?: number;
    location?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
    };
}

export interface CheckIn {
    id: string;
    user_id: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    message?: string;
    battery_level?: number;
    created_at: string;
}

// ============================================================================
// FAMILY LINK MANAGEMENT
// ============================================================================

/**
 * Create a family link between parent and child
 */
export async function createFamilyLink(
    parentId: string,
    childId: string,
    options?: {
        relationshipType?: 'parent-child' | 'guardian-ward';
        delegationType?: string;
        consentDuration?: number; // in milliseconds
        notes?: string;
    }
): Promise<{ data: FamilyLink | null; error: string | null }> {
    try {
        const consentUntil = options?.consentDuration
            ? new Date(Date.now() + options.consentDuration).toISOString()
            : new Date(Date.now() + 86400000).toISOString(); // 24 hours default

        const { data, error } = await supabase
            .from('family_links')
            .insert({
                parent_id: parentId,
                child_id: childId,
                relationship_type: options?.relationshipType || 'parent-child',
                delegation_type: options?.delegationType || 'parent-child',
                tracking_consent_until: consentUntil,
                status: 'active',
                notes: options?.notes,
            })
            .select()
            .single();

        if (error) {
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

/**
 * Generate invite code for family member
 */
export async function generateInviteCode(
    parentId: string,
    expiresIn: number = 86400000 // 24 hours default
): Promise<{ code: string | null; error: string | null }> {
    try {
        // Generate random invite code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const expiresAt = new Date(Date.now() + expiresIn).toISOString();

        // Store invite code (we'll create a temporary link)
        const { data, error } = await supabase
            .from('family_links')
            .insert({
                parent_id: parentId,
                child_id: parentId, // Temporary, will be updated when joined
                status: 'pending',
                invite_code: code,
                invite_expires_at: expiresAt,
            })
            .select()
            .single();

        if (error) {
            return { code: null, error: error.message };
        }

        return { code, error: null };
    } catch (error: any) {
        return { code: null, error: error.message };
    }
}

/**
 * Join family using invite code
 */
export async function joinFamilyWithCode(
    childId: string,
    inviteCode: string
): Promise<{ data: FamilyLink | null; error: string | null }> {
    try {
        // Find invite
        const { data: invite, error: inviteError } = await supabase
            .from('family_links')
            .select('*')
            .eq('invite_code', inviteCode)
            .eq('status', 'pending')
            .single();

        if (inviteError || !invite) {
            return { data: null, error: 'Invalid or expired invite code' };
        }

        // Check if expired
        if (invite.invite_expires_at && new Date(invite.invite_expires_at) < new Date()) {
            return { data: null, error: 'Invite code has expired' };
        }

        // Update link with child ID
        const { data, error } = await supabase
            .from('family_links')
            .update({
                child_id: childId,
                status: 'active',
                invite_code: null, // Clear invite code
                invite_expires_at: null,
            })
            .eq('parent_id', invite.parent_id)
            .eq('invite_code', inviteCode)
            .select()
            .single();

        if (error) {
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

/**
 * Get family members for a user
 */
export async function getFamilyMembers(
    userId: string
): Promise<{ data: FamilyMember[] | null; error: string | null }> {
    try {
        // Get family links where user is parent or child
        const { data: links, error: linksError } = await supabase
            .from('family_links')
            .select('*')
            .or(`parent_id.eq.${userId},child_id.eq.${userId}`)
            .eq('status', 'active');

        if (linksError) {
            return { data: null, error: linksError.message };
        }

        if (!links || links.length === 0) {
            return { data: [], error: null };
        }

        // Get member IDs
        const memberIds = links.map((link) =>
            link.parent_id === userId ? link.child_id : link.parent_id
        );

        // Get member profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, email, phone, photo, role')
            .in('id', memberIds);

        if (profilesError) {
            return { data: null, error: profilesError.message };
        }

        // Get latest locations for members
        const { data: locations, error: locationsError } = await supabase
            .from('live_locations')
            .select('*')
            .in('user_id', memberIds)
            .eq('is_active', true);

        // Combine data
        const members: FamilyMember[] = profiles?.map((profile) => {
            const link = links.find((l) =>
                l.parent_id === profile.id || l.child_id === profile.id
            )!;
            const location = locations?.find((l) => l.user_id === profile.id);

            return {
                ...profile,
                relationship: link.parent_id === userId ? 'child' : 'parent',
                can_view_location: link.can_view_location,
                status: link.status,
                last_seen: location?.updated_at,
                battery_level: location?.battery_level,
                location: location
                    ? {
                        latitude: parseFloat(location.location.split('(')[1].split(' ')[1]),
                        longitude: parseFloat(location.location.split('(')[1].split(' ')[0]),
                        accuracy: location.accuracy,
                    }
                    : undefined,
            };
        }) || [];

        return { data: members, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

/**
 * Update tracking consent
 */
export async function updateTrackingConsent(
    parentId: string,
    childId: string,
    consentUntil: Date
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('family_links')
            .update({
                tracking_consent_until: consentUntil.toISOString(),
                status: 'active',
            })
            .eq('parent_id', parentId)
            .eq('child_id', childId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Revoke family link
 */
export async function revokeFamilyLink(
    parentId: string,
    childId: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('family_links')
            .update({ status: 'revoked' })
            .eq('parent_id', parentId)
            .eq('child_id', childId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================================================================
// PANIC WORD MANAGEMENT
// ============================================================================

/**
 * Set panic word for user (encrypted)
 */
export async function setPanicWord(
    userId: string,
    word: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Dynamically import bcrypt (only works server-side)
        const bcrypt = (await import('bcryptjs')).default;

        // Encrypt the word
        const salt = await bcrypt.genSalt(10);
        const encryptedWord = await bcrypt.hash(word.toLowerCase().trim(), salt);

        // Deactivate old panic words
        await supabase
            .from('panic_words')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('is_active', true);

        // Insert new panic word
        const { error } = await supabase.from('panic_words').insert({
            user_id: userId,
            encrypted_word: encryptedWord,
            is_active: true,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Check if word matches panic word
 */
export async function checkPanicWord(
    userId: string,
    word: string
): Promise<{ isMatch: boolean; error: string | null }> {
    try {
        // Dynamically import bcrypt (only works server-side)
        const bcrypt = (await import('bcryptjs')).default;

        const { data, error } = await supabase
            .from('panic_words')
            .select('encrypted_word')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return { isMatch: false, error: error?.message || 'No panic word set' };
        }

        const isMatch = await bcrypt.compare(word.toLowerCase().trim(), data.encrypted_word);

        if (isMatch) {
            // Update trigger count
            await supabase
                .from('panic_words')
                .update({
                    last_triggered: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .eq('is_active', true);
        }

        return { isMatch, error: null };
    } catch (error: any) {
        return { isMatch: false, error: error.message };
    }
}

// ============================================================================
// CHECK-INS
// ============================================================================

/**
 * Send "I'm safe" check-in
 */
export async function sendCheckIn(
    userId: string,
    options?: {
        message?: string;
        latitude?: number;
        longitude?: number;
        batteryLevel?: number;
    }
): Promise<{ success: boolean; error: string | null }> {
    try {
        const location = options?.latitude && options?.longitude
            ? `POINT(${options.longitude} ${options.latitude})`
            : null;

        const { error } = await supabase.from('check_ins').insert({
            user_id: userId,
            location,
            message: options?.message,
            battery_level: options?.batteryLevel,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Update last_check_in in family_links
        await supabase
            .from('family_links')
            .update({ last_check_in: new Date().toISOString() })
            .or(`parent_id.eq.${userId},child_id.eq.${userId}`);

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get recent check-ins for a user
 */
export async function getCheckIns(
    userId: string,
    limit: number = 10
): Promise<{ data: CheckIn[] | null; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('check_ins')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}
