import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/zones/nearby?lat=X&lng=Y&radius=1000
 * Get all zones within radius of location
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const radius = searchParams.get('radius') || '1000'; // default 1km

        if (!lat || !lng) {
            return NextResponse.json(
                { error: 'Missing lat/lng parameters' },
                { status: 400 }
            );
        }

        const point = `POINT(${lng} ${lat})`;
        const radiusMeters = parseInt(radius);

        // Get nearby safe zones
        const { data: safeZones, error: safeError } = await supabase.rpc(
            'get_nearby_safe_zones',
            {
                p_lat: parseFloat(lat),
                p_lng: parseFloat(lng),
                p_radius: radiusMeters,
                p_user_id: user.id,
            }
        );

        // Get nearby risk zones
        const { data: riskZones, error: riskError } = await supabase.rpc(
            'get_nearby_risk_zones',
            {
                p_lat: parseFloat(lat),
                p_lng: parseFloat(lng),
                p_radius: radiusMeters,
                p_user_id: user.id,
            }
        );

        return NextResponse.json({
            success: true,
            safeZones: safeZones || [],
            riskZones: riskZones || [],
            total: (safeZones?.length || 0) + (riskZones?.length || 0),
            radius: radiusMeters,
        });
    } catch (error: any) {
        console.error('Error in GET /api/zones/nearby:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
