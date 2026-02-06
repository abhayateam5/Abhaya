import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/family/check-in
 * Send "I'm safe" check-in
 */
export async function POST(request: NextRequest) {
    try {
        // Get authenticated client and user in one call
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, batteryLevel, latitude, longitude } = body;

        // Build location point if coordinates provided
        const locationPoint = latitude && longitude
            ? `SRID=4326;POINT(${longitude} ${latitude})`
            : null;

        // Insert check-in (using correct schema)
        const { error } = await supabase.from('check_ins').insert({
            user_id: user.id,
            message: message || "I'm safe",
            location: locationPoint,
            battery_level: batteryLevel,
        });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Error in POST /api/family/check-in:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/family/check-in
 * Get recent check-ins
 */
export async function GET(request: NextRequest) {
    try {
        // Get authenticated client and user in one call
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Get check-ins
        const { data, error } = await supabase
            .from('check_ins')
            .select('*')
            .eq('user_id', user.id)
            .order('check_in_time', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/family/check-in:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
