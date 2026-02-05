import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/location/batch
 * Batch save offline locations
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { locations } = body;

        if (!Array.isArray(locations) || locations.length === 0) {
            return NextResponse.json({ error: 'Invalid locations array' }, { status: 400 });
        }

        // Prepare batch insert
        const locationRecords = locations.map((loc) => ({
            user_id: user.id,
            location: `POINT(${loc.longitude} ${loc.latitude})`,
            accuracy: loc.accuracy,
            altitude: loc.altitude,
            speed: loc.speed,
            heading: loc.heading,
            tracking_mode: 'balanced',
            is_active: false, // Historical data
            created_at: new Date(loc.timestamp).toISOString(),
        }));

        // Insert all locations
        const { error } = await supabase.from('live_locations').insert(locationRecords);

        if (error) {
            console.error('Error batch saving locations:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { success: true, synced: locations.length },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error in POST /api/location/batch:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
