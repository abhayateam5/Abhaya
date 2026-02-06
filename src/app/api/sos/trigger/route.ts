import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';
import { getCurrentLocation } from '@/lib/location';

/**
 * POST /api/sos/trigger
 * Trigger a new SOS event
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { mode, description, latitude, longitude } = body;

        // Validate trigger mode
        const validModes = ['button', 'silent', 'panic_word', 'shake', 'volume'];
        if (!validModes.includes(mode)) {
            return NextResponse.json(
                { error: 'Invalid trigger mode' },
                { status: 400 }
            );
        }

        // Rate limiting disabled for testing
        // const { data: canTrigger, error: rateLimitError } = await supabase.rpc(
        //     'check_sos_rate_limit',
        //     { p_user_id: user.id }
        // );
        //
        // if (rateLimitError) {
        //     console.error('Rate limit check error:', rateLimitError);
        //     return NextResponse.json(
        //         { error: 'Error checking rate limit' },
        //         { status: 500 }
        //     );
        // }
        //
        // if (!canTrigger) {
        //     return NextResponse.json(
        //         { error: 'SOS rate limit exceeded (max 3/hour)' },
        //         { status: 429 }
        //     );
        // }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('name, phone')
            .eq('id', user.id)
            .single();

        // Use provided location or default to null
        const locationPoint = latitude && longitude
            ? `SRID=4326;POINT(${longitude} ${latitude})`
            : null;

        if (!locationPoint) {
            return NextResponse.json(
                { error: 'Location is required for SOS' },
                { status: 400 }
            );
        }

        // Calculate confidence score (clamped 0-100)
        let confidenceScore = mode === 'button' ? 95 : 85;
        if (description) confidenceScore += 5;
        confidenceScore = Math.min(100, Math.max(0, confidenceScore));

        // Create SOS event
        const { data: sosEvent, error: sosError } = await supabase
            .from('sos_events')
            .insert({
                user_id: user.id,
                user_name: profile?.name || 'Unknown',
                user_phone: profile?.phone || 'Unknown',
                trigger_mode: mode,
                status: 'triggered',
                priority: 'critical',
                location: locationPoint,
                description: description || null,
                confidence_score: confidenceScore,
                escalation_level: 0,
            })
            .select()
            .single();

        if (sosError) {
            console.error('SOS creation error:', sosError);
            return NextResponse.json(
                { error: sosError.message },
                { status: 500 }
            );
        }

        // Create initial escalation (Level 0: Family)
        const { error: escalationError } = await supabase
            .from('sos_escalations')
            .insert({
                sos_event_id: sosEvent.id,
                escalation_level: 0,
                target_type: 'family',
                status: 'sent',
            });

        if (escalationError) {
            console.error('Escalation creation error:', escalationError);
        }

        // TODO: Send notifications to family members via Realtime

        return NextResponse.json({
            success: true,
            sosId: sosEvent.id,
            message: 'SOS triggered successfully',
        });
    } catch (error: any) {
        console.error('Error in POST /api/sos/trigger:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
