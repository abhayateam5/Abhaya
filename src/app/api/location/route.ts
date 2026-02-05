import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/location
 * Save location update
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.latitude || !body.longitude) {
            return NextResponse.json(
                { error: 'Missing required fields: latitude, longitude' },
                { status: 400 }
            );
        }

        // Create PostGIS point
        const point = `POINT(${body.longitude} ${body.latitude})`;

        // Insert location
        const { data, error } = await supabase
            .from('live_locations')
            .upsert({
                user_id: user.id,
                location: point,
                accuracy: body.accuracy,
                altitude: body.altitude,
                speed: body.speed,
                heading: body.heading,
                battery_level: body.battery_level,
                tracking_mode: body.mode || 'balanced',
                is_active: true,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving location:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If GPS spoofed, log warning
        if (body.is_spoofed) {
            console.warn(`GPS spoofing detected for user ${user.id}`);

            // Create event for spoofing detection
            await supabase.from('events').insert({
                user_id: user.id,
                event_type: 'ANOMALY_DETECTED',
                severity: 'warning',
                metadata: {
                    type: 'gps_spoofing',
                    latitude: body.latitude,
                    longitude: body.longitude,
                },
                location: point,
            });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        console.error('Error in POST /api/location:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/location/latest
 * Get user's latest location
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('live_locations')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Error fetching location:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/location:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
