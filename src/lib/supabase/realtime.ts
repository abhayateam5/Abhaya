/**
 * ABHAYA Realtime System
 * Supabase Realtime channel management for priority-based event broadcasting
 */

import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// CHANNEL NAMES (Priority-based)
// ============================================================================

export const CHANNELS = {
    SOS_ALERTS: 'sos-alerts',           // Critical priority
    FAMILY_LOCATIONS: 'family-locations', // High priority (5s updates during SOS)
    ZONE_ALERTS: 'zone-alerts',         // Medium priority
    NOTIFICATIONS: 'notifications',      // Low priority
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface SOSAlert {
    id: string;
    user_id: string;
    user_name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    timestamp: string;
    reason?: string;
}

export interface LocationUpdate {
    user_id: string;
    location: {
        latitude: number;
        longitude: number;
    };
    accuracy?: number;
    timestamp: string;
}

export interface ZoneAlert {
    user_id: string;
    zone_id: string;
    zone_name: string;
    zone_type: 'safe' | 'risk';
    entered: boolean;
    location: {
        latitude: number;
        longitude: number;
    };
    timestamp: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    timestamp: string;
}

// ============================================================================
// SOS ALERTS CHANNEL (Critical Priority)
// ============================================================================

/**
 * Subscribe to SOS alerts
 * @param callback Function to call when SOS alert received
 * @returns Channel object (call .unsubscribe() to stop)
 */
export function subscribeToSOSAlerts(
    callback: (alert: SOSAlert) => void
): RealtimeChannel {
    const channel = supabase
        .channel(CHANNELS.SOS_ALERTS)
        .on('broadcast', { event: 'sos-triggered' }, (payload) => {
            callback(payload.payload as SOSAlert);
        })
        .subscribe();

    return channel;
}

/**
 * Broadcast SOS alert to all subscribers
 * @param alert SOS alert data
 */
export async function broadcastSOSAlert(alert: SOSAlert): Promise<void> {
    const channel = supabase.channel(CHANNELS.SOS_ALERTS);
    await channel.send({
        type: 'broadcast',
        event: 'sos-triggered',
        payload: alert,
    });
}

// ============================================================================
// FAMILY LOCATIONS CHANNEL (High Priority)
// ============================================================================

/**
 * Subscribe to family member location updates
 * @param familyIds Array of family member user IDs
 * @param callback Function to call when location update received
 * @returns Channel object
 */
export function subscribeToFamilyLocations(
    familyIds: string[],
    callback: (update: LocationUpdate) => void
): RealtimeChannel {
    const channel = supabase
        .channel(CHANNELS.FAMILY_LOCATIONS)
        .on('broadcast', { event: 'location-update' }, (payload) => {
            const update = payload.payload as LocationUpdate;
            // Only process if it's from a family member
            if (familyIds.includes(update.user_id)) {
                callback(update);
            }
        })
        .subscribe();

    return channel;
}

/**
 * Broadcast location update
 * @param update Location update data
 */
export async function broadcastLocationUpdate(update: LocationUpdate): Promise<void> {
    const channel = supabase.channel(CHANNELS.FAMILY_LOCATIONS);
    await channel.send({
        type: 'broadcast',
        event: 'location-update',
        payload: update,
    });
}

// ============================================================================
// ZONE ALERTS CHANNEL (Medium Priority)
// ============================================================================

/**
 * Subscribe to zone entry/exit alerts
 * @param callback Function to call when zone alert received
 * @returns Channel object
 */
export function subscribeToZoneAlerts(
    callback: (alert: ZoneAlert) => void
): RealtimeChannel {
    const channel = supabase
        .channel(CHANNELS.ZONE_ALERTS)
        .on('broadcast', { event: 'zone-change' }, (payload) => {
            callback(payload.payload as ZoneAlert);
        })
        .subscribe();

    return channel;
}

/**
 * Broadcast zone alert
 * @param alert Zone alert data
 */
export async function broadcastZoneAlert(alert: ZoneAlert): Promise<void> {
    const channel = supabase.channel(CHANNELS.ZONE_ALERTS);
    await channel.send({
        type: 'broadcast',
        event: 'zone-change',
        payload: alert,
    });
}

// ============================================================================
// NOTIFICATIONS CHANNEL (Low Priority)
// ============================================================================

/**
 * Subscribe to general notifications
 * @param userId User ID to receive notifications for
 * @param callback Function to call when notification received
 * @returns Channel object
 */
export function subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
): RealtimeChannel {
    const channel = supabase
        .channel(CHANNELS.NOTIFICATIONS)
        .on('broadcast', { event: 'notification' }, (payload) => {
            const notification = payload.payload as Notification;
            // Only process if it's for this user
            if (notification.user_id === userId) {
                callback(notification);
            }
        })
        .subscribe();

    return channel;
}

/**
 * Broadcast notification
 * @param notification Notification data
 */
export async function broadcastNotification(notification: Notification): Promise<void> {
    const channel = supabase.channel(CHANNELS.NOTIFICATIONS);
    await channel.send({
        type: 'broadcast',
        event: 'notification',
        payload: notification,
    });
}

// ============================================================================
// CHANNEL MANAGEMENT
// ============================================================================

/**
 * Unsubscribe from a channel
 * @param channel Channel to unsubscribe from
 */
export async function unsubscribeChannel(channel: RealtimeChannel): Promise<void> {
    await channel.unsubscribe();
}

/**
 * Unsubscribe from all channels
 */
export async function unsubscribeAll(): Promise<void> {
    await supabase.removeAllChannels();
}

/**
 * Get channel status
 * @param channel Channel to check
 * @returns Status string
 */
export function getChannelStatus(channel: RealtimeChannel): string {
    return channel.state;
}
