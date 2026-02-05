/**
 * ABHAYA Event System
 * Comprehensive event logging and real-time event management
 */

import { supabase } from './supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type EventType =
    | 'SOS_TRIGGERED'
    | 'SOS_ACKNOWLEDGED'
    | 'SOS_RESOLVED'
    | 'ZONE_ENTERED'
    | 'ZONE_EXITED'
    | 'ANOMALY_DETECTED'
    | 'LOCATION_UPDATED'
    | 'CHECKPOINT_MISSED'
    | 'CHECKPOINT_REACHED'
    | 'FAMILY_LINK_CREATED'
    | 'FAMILY_LINK_REMOVED'
    | 'EFIR_SUBMITTED'
    | 'EFIR_UPDATED'
    | 'PROFILE_UPDATED'
    | 'ITINERARY_CREATED'
    | 'ITINERARY_UPDATED'
    | 'SAFETY_SCORE_CHANGED'
    | 'USER_ONLINE'
    | 'USER_OFFLINE';

export type EventSeverity = 'info' | 'warning' | 'critical';

export interface Event {
    id: string;
    user_id: string;
    event_type: EventType;
    severity: EventSeverity;
    event_data: Record<string, any>;
    location?: {
        latitude: number;
        longitude: number;
    };
    created_at: string;
}

export interface CreateEventParams {
    user_id: string;
    event_type: EventType;
    severity: EventSeverity;
    event_data?: Record<string, any>;
    location?: {
        latitude: number;
        longitude: number;
    };
}

export interface GetEventsParams {
    user_id?: string;
    event_type?: EventType;
    severity?: EventSeverity;
    limit?: number;
    from_date?: Date;
    to_date?: Date;
}

// ============================================================================
// EVENT CREATION
// ============================================================================

/**
 * Create a new event in the system
 * @param params Event parameters
 * @returns Created event or error
 */
export async function createEvent(params: CreateEventParams): Promise<{ data: Event | null; error: any }> {
    try {
        const eventData: any = {
            user_id: params.user_id,
            event_type: params.event_type,
            severity: params.severity,
            event_data: params.event_data || {},
        };

        // Add location if provided (convert to PostGIS format)
        if (params.location) {
            eventData.location = `POINT(${params.location.longitude} ${params.location.latitude})`;
        }

        const { data, error } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();

        if (error) {
            console.error('Error creating event:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception creating event:', error);
        return { data: null, error };
    }
}

// ============================================================================
// EVENT QUERIES
// ============================================================================

/**
 * Get events with optional filters
 * @param params Query parameters
 * @returns List of events or error
 */
export async function getEvents(params: GetEventsParams = {}): Promise<{ data: Event[] | null; error: any }> {
    try {
        let query = supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (params.user_id) {
            query = query.eq('user_id', params.user_id);
        }

        if (params.event_type) {
            query = query.eq('event_type', params.event_type);
        }

        if (params.severity) {
            query = query.eq('severity', params.severity);
        }

        if (params.from_date) {
            query = query.gte('created_at', params.from_date.toISOString());
        }

        if (params.to_date) {
            query = query.lte('created_at', params.to_date.toISOString());
        }

        if (params.limit) {
            query = query.limit(params.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching events:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception fetching events:', error);
        return { data: null, error };
    }
}

/**
 * Get recent events for a user
 * @param userId User ID
 * @param limit Number of events to fetch
 * @returns Recent events
 */
export async function getRecentEvents(userId: string, limit: number = 50): Promise<{ data: Event[] | null; error: any }> {
    return getEvents({ user_id: userId, limit });
}

/**
 * Get critical events for family members
 * @param userId User ID
 * @param hours Number of hours to look back
 * @returns Critical family events
 */
export async function getFamilyCriticalEvents(userId: string, hours: number = 24): Promise<{ data: any[] | null; error: any }> {
    try {
        const { data, error } = await supabase
            .rpc('get_family_critical_events', {
                p_user_id: userId,
                p_hours: hours,
            });

        if (error) {
            console.error('Error fetching family critical events:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception fetching family critical events:', error);
        return { data: null, error };
    }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to events for a user
 * @param userId User ID
 * @param callback Callback function when new event arrives
 * @returns Subscription object (call .unsubscribe() to stop)
 */
export function subscribeToUserEvents(
    userId: string,
    callback: (event: Event) => void
) {
    const channel = supabase
        .channel(`user-events:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'events',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                callback(payload.new as Event);
            }
        )
        .subscribe();

    return channel;
}

/**
 * Subscribe to critical events (SOS alerts)
 * @param callback Callback function when critical event arrives
 * @returns Subscription object
 */
export function subscribeToCriticalEvents(callback: (event: Event) => void) {
    const channel = supabase
        .channel('critical-events')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'events',
                filter: 'severity=eq.critical',
            },
            (payload) => {
                callback(payload.new as Event);
            }
        )
        .subscribe();

    return channel;
}

/**
 * Subscribe to specific event type
 * @param eventType Event type to subscribe to
 * @param callback Callback function
 * @returns Subscription object
 */
export function subscribeToEventType(
    eventType: EventType,
    callback: (event: Event) => void
) {
    const channel = supabase
        .channel(`event-type:${eventType}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'events',
                filter: `event_type=eq.${eventType}`,
            },
            (payload) => {
                callback(payload.new as Event);
            }
        )
        .subscribe();

    return channel;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log SOS event
 */
export async function logSOSEvent(userId: string, location: { latitude: number; longitude: number }, reason?: string) {
    return createEvent({
        user_id: userId,
        event_type: 'SOS_TRIGGERED',
        severity: 'critical',
        event_data: { reason },
        location,
    });
}

/**
 * Log zone entry/exit
 */
export async function logZoneEvent(
    userId: string,
    zoneId: string,
    zoneName: string,
    entered: boolean,
    location: { latitude: number; longitude: number }
) {
    return createEvent({
        user_id: userId,
        event_type: entered ? 'ZONE_ENTERED' : 'ZONE_EXITED',
        severity: 'info',
        event_data: { zone_id: zoneId, zone_name: zoneName },
        location,
    });
}

/**
 * Log anomaly detection
 */
export async function logAnomalyEvent(
    userId: string,
    anomalyType: string,
    details: Record<string, any>,
    location?: { latitude: number; longitude: number }
) {
    return createEvent({
        user_id: userId,
        event_type: 'ANOMALY_DETECTED',
        severity: 'warning',
        event_data: { anomaly_type: anomalyType, ...details },
        location,
    });
}

/**
 * Log user presence change
 */
export async function logPresenceEvent(userId: string, online: boolean) {
    return createEvent({
        user_id: userId,
        event_type: online ? 'USER_ONLINE' : 'USER_OFFLINE',
        severity: 'info',
        event_data: { timestamp: new Date().toISOString() },
    });
}
