/**
 * SOS System - Core Utilities
 * Handles SOS triggering, escalation, evidence capture, and confidence scoring
 */

import { createClient } from '@/lib/supabase/client';

// Types
export type TriggerMode = 'button' | 'silent' | 'panic_word' | 'shake' | 'volume';
export type SOSStatus = 'triggered' | 'acknowledged' | 'responding' | 'verified' | 'resolved' | 'false_alarm';
export type EscalationLevel = 0 | 1 | 2 | 3;

export interface SOSEvent {
    id: string;
    user_id: string;
    trigger_mode: TriggerMode;
    status: SOSStatus;
    confidence_score: number;
    escalation_level: EscalationLevel;
    location: { latitude: number; longitude: number };
    description?: string;
    created_at: string;
}

export interface SOSEvidence {
    id: string;
    sos_event_id: string;
    evidence_type: 'photo' | 'audio' | 'screen' | 'location' | 'sensor';
    storage_path: string;
    captured_at: string;
}

/**
 * Trigger a new SOS event
 */
export async function triggerSOS(params: {
    mode: TriggerMode;
    location: { latitude: number; longitude: number };
    description?: string;
    address?: string;
}): Promise<{ data: SOSEvent | null; error: any }> {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
    }

    // Check rate limit
    const canTrigger = await checkRateLimit(user.id);
    if (!canTrigger) {
        return { data: null, error: { message: 'SOS rate limit exceeded (max 3/hour)' } };
    }

    // Get user profile for denormalized fields
    const { data: profile } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore({
        mode: params.mode,
        hasDescription: !!params.description,
        userHistory: 0, // TODO: Get false alarm count from history
    });

    // Create location point (PostGIS format)
    const locationPoint = `SRID=4326;POINT(${params.location.longitude} ${params.location.latitude})`;

    // Create SOS event
    const { data, error } = await supabase
        .from('sos_events')
        .insert({
            user_id: user.id,
            user_name: profile?.name || 'Unknown',
            user_phone: profile?.phone || 'Unknown',
            trigger_mode: params.mode,
            status: params.mode === 'silent' ? 'triggered' : 'triggered',
            priority: 'critical',
            location: locationPoint,
            address: params.address,
            description: params.description,
            confidence_score: confidenceScore,
            escalation_level: 0,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating SOS:', error);
        return { data: null, error };
    }

    // Start escalation chain
    await initiateEscalation(data.id, 0);

    return { data, error: null };
}

/**
 * Update SOS status
 */
export async function updateSOSStatus(
    sosId: string,
    status: SOSStatus,
    officerId?: string
): Promise<{ error: any }> {
    const supabase = createClient();

    const updates: any = { status };

    // Add timestamps based on status
    if (status === 'acknowledged' && officerId) {
        updates.acknowledged_by = officerId;
        updates.acknowledged_at = new Date().toISOString();
    } else if (status === 'responding' && officerId) {
        updates.responding_officer_id = officerId;
        updates.response_time = new Date().toISOString();
    } else if (status === 'resolved') {
        updates.resolution_time = new Date().toISOString();
    }

    const { error } = await supabase
        .from('sos_events')
        .update(updates)
        .eq('id', sosId);

    return { error };
}

/**
 * Acknowledge SOS (for police)
 */
export async function acknowledgeSOS(sosId: string): Promise<{ error: any }> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: 'Not authenticated' } };
    }

    return await updateSOSStatus(sosId, 'acknowledged', user.id);
}

/**
 * Check if user can trigger SOS (rate limiting)
 */
export async function checkRateLimit(userId: string): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase.rpc('check_sos_rate_limit', {
        p_user_id: userId,
    });

    if (error) {
        console.error('Rate limit check error:', error);
        return false;
    }

    return data === true;
}

/**
 * Calculate confidence score for SOS event
 * Higher score = more likely to be genuine
 */
export function calculateConfidenceScore(params: {
    mode: TriggerMode;
    hasDescription: boolean;
    userHistory: number; // False alarm count
}): number {
    let score = 100;

    // Reduce score based on trigger mode
    const modeScores: Record<TriggerMode, number> = {
        button: 100,
        shake: 95,
        panic_word: 90,
        volume: 85,
        silent: 80,
    };
    score = modeScores[params.mode];

    // Increase score if description provided
    if (params.hasDescription) {
        score += 5;
    }

    // Reduce score based on false alarm history
    score -= params.userHistory * 10;

    // Clamp to 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * Initiate escalation for SOS event
 */
async function initiateEscalation(sosId: string, level: EscalationLevel): Promise<void> {
    const supabase = createClient();

    const targetTypes = ['family', 'police', 'emergency_services', 'embassy'];
    const targetType = targetTypes[level];

    await supabase.from('sos_escalations').insert({
        sos_event_id: sosId,
        escalation_level: level,
        target_type: targetType,
        status: 'pending',
    });

    // TODO: Implement actual notification logic
    console.log(`Escalation level ${level} initiated for SOS ${sosId}`);
}

/**
 * Escalate SOS to next level
 */
export async function escalateSOS(sosId: string): Promise<{ error: any }> {
    const supabase = createClient();

    // Get next escalation level
    const { data: nextLevel, error: levelError } = await supabase.rpc(
        'get_next_escalation_level',
        { p_sos_id: sosId }
    );

    if (levelError || !nextLevel || nextLevel > 3) {
        return { error: levelError || { message: 'Max escalation reached' } };
    }

    // Update SOS escalation level
    await supabase
        .from('sos_events')
        .update({ escalation_level: nextLevel })
        .eq('id', sosId);

    // Create escalation record
    await initiateEscalation(sosId, nextLevel as EscalationLevel);

    return { error: null };
}

/**
 * Save evidence for SOS event
 */
export async function saveEvidence(params: {
    sosId: string;
    type: 'photo' | 'audio' | 'screen' | 'location' | 'sensor';
    file?: File;
    sensorData?: any;
}): Promise<{ error: any }> {
    const supabase = createClient();

    let storagePath = '';

    // Upload file if provided
    if (params.file) {
        const fileName = `${params.sosId}/${Date.now()}_${params.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('alert-evidence')
            .upload(fileName, params.file);

        if (uploadError) {
            return { error: uploadError };
        }

        storagePath = uploadData.path;
    }

    // Save evidence record
    const { error } = await supabase.from('sos_evidence').insert({
        sos_event_id: params.sosId,
        evidence_type: params.type,
        storage_path: storagePath || 'sensor-data',
        mime_type: params.file?.type,
        file_size: params.file?.size,
        sensor_data: params.sensorData,
    });

    return { error };
}

/**
 * Get active SOS events (for police dashboard)
 */
export async function getActiveSOSEvents(): Promise<{
    data: SOSEvent[] | null;
    error: any;
}> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('sos_events')
        .select('*')
        .in('status', ['triggered', 'acknowledged', 'responding'])
        .order('created_at', { ascending: false });

    return { data, error };
}

/**
 * Get SOS history for current user
 */
export async function getSOSHistory(): Promise<{
    data: SOSEvent[] | null;
    error: any;
}> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data, error } = await supabase
        .from('sos_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    return { data, error };
}
