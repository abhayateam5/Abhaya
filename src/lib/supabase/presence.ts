/**
 * ABHAYA Presence System
 * Track online/offline status and auto-escalate if user offline during SOS
 */

import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface PresenceState {
    user_id: string;
    user_name: string;
    online: boolean;
    last_seen: string;
    device_id?: string;
}

export interface PresenceUpdate {
    user_id: string;
    online: boolean;
    timestamp: string;
}

// ============================================================================
// PRESENCE TRACKING
// ============================================================================

/**
 * Track user presence (mark as online)
 * @param userId User ID
 * @param userName User name
 * @param deviceId Optional device ID
 * @returns Presence channel
 */
export function trackPresence(
    userId: string,
    userName: string,
    deviceId?: string
): RealtimeChannel {
    const channel = supabase.channel('presence', {
        config: {
            presence: {
                key: userId,
            },
        },
    });

    channel
        .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            console.log('Presence synced:', state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // Track this user as online
                await channel.track({
                    user_id: userId,
                    user_name: userName,
                    online: true,
                    last_seen: new Date().toISOString(),
                    device_id: deviceId,
                });
            }
        });

    return channel;
}

/**
 * Get online users from presence state
 * @param channel Presence channel
 * @returns Array of online users
 */
export function getOnlineUsers(channel: RealtimeChannel): PresenceState[] {
    const state = channel.presenceState();
    const onlineUsers: PresenceState[] = [];

    Object.keys(state).forEach((key) => {
        const presences = state[key];
        if (presences && presences.length > 0) {
            // Get the most recent presence for this user
            const presence = presences[0] as unknown as PresenceState;
            onlineUsers.push(presence);
        }
    });

    return onlineUsers;
}

/**
 * Subscribe to presence changes
 * @param onJoin Callback when user comes online
 * @param onLeave Callback when user goes offline
 * @returns Presence channel
 */
export function subscribeToPresence(
    onJoin: (user: PresenceState) => void,
    onLeave: (user: PresenceState) => void
): RealtimeChannel {
    const channel = supabase.channel('presence');

    channel
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            newPresences.forEach((presence) => {
                onJoin(presence as unknown as PresenceState);
            });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            leftPresences.forEach((presence) => {
                onLeave(presence as unknown as PresenceState);
            });
        })
        .subscribe();

    return channel;
}

/**
 * Check if a specific user is online
 * @param channel Presence channel
 * @param userId User ID to check
 * @returns True if user is online
 */
export function isUserOnline(channel: RealtimeChannel, userId: string): boolean {
    const onlineUsers = getOnlineUsers(channel);
    return onlineUsers.some((user) => user.user_id === userId);
}

/**
 * Get family members who are online
 * @param channel Presence channel
 * @param familyIds Array of family member user IDs
 * @returns Array of online family members
 */
export function getOnlineFamilyMembers(
    channel: RealtimeChannel,
    familyIds: string[]
): PresenceState[] {
    const onlineUsers = getOnlineUsers(channel);
    return onlineUsers.filter((user) => familyIds.includes(user.user_id));
}

// ============================================================================
// AUTO-ESCALATION LOGIC
// ============================================================================

/**
 * Check if SOS should be auto-escalated due to user being offline
 * @param channel Presence channel
 * @param userId User ID who triggered SOS
 * @param familyIds Family member IDs
 * @returns True if should escalate to police
 */
export function shouldEscalateSOS(
    channel: RealtimeChannel,
    userId: string,
    familyIds: string[]
): boolean {
    // If user is offline, escalate
    if (!isUserOnline(channel, userId)) {
        return true;
    }

    // If all family members are offline, escalate
    const onlineFamily = getOnlineFamilyMembers(channel, familyIds);
    if (onlineFamily.length === 0 && familyIds.length > 0) {
        return true;
    }

    return false;
}

/**
 * Update user's last seen timestamp
 * @param userId User ID
 */
export async function updateLastSeen(userId: string): Promise<void> {
    try {
        await supabase
            .from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('id', userId);
    } catch (error) {
        console.error('Error updating last seen:', error);
    }
}

/**
 * Mark user as offline (cleanup on disconnect)
 * @param channel Presence channel
 */
export async function markOffline(channel: RealtimeChannel): Promise<void> {
    await channel.untrack();
}
