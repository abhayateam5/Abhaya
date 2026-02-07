import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/zones/check
 * Check if a location is in any zone
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { lat, lng } = body;

        if (!lat || !lng) {
            return NextResponse.json(
                { error: 'Missing lat/lng' },
                { status: 400 }
            );
        }

        // Use the database function to check zones
        const { data: zones, error } = await supabase.rpc('check_zones_at_location', {
            p_lat: parseFloat(lat),
            p_lng: parseFloat(lng),
            p_user_id: user.id,
        });

        if (error) {
            console.error('Error checking zones:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const safeZones = zones?.filter((z: any) => z.zone_type === 'safe') || [];
        const riskZones = zones?.filter((z: any) => z.zone_type === 'risk') || [];

        return NextResponse.json({
            success: true,
            inSafeZone: safeZones.length > 0,
            inRiskZone: riskZones.length > 0,
            zones: zones || [],
            safeZones,
            riskZones,
        });
    } catch (error: any) {
        console.error('Error in POST /api/zones/check:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
