import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/zones/create
 * Create a personal safe or danger zone
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        // Use hardcoded test user ID (Phase 6 solution for test pages)
        const TEST_USER_ID = 'd74a4a73-7938-43c6-b54f-98b604579972';
        const userId = user?.id || TEST_USER_ID;

        const body = await request.json();
        const { name, zone_type, center_lat, center_lng, radius, type } = body;

        // Validate required fields
        if (!name || !zone_type || !center_lat || !center_lng || !radius) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create zone based on type
        const tableName = zone_type === 'safe' ? 'safe_zones' : 'risk_zones';

        const zoneData: any = {
            name,
            user_id: userId,
            is_personal: false,
            is_active: true,
            center_point: `POINT(${center_lng} ${center_lat})`,
            radius: parseInt(radius),
        };

        if (zone_type === 'safe') {
            zoneData.type = type || 'public_place';
            zoneData.safety_rating = 5;
        } else {
            zoneData.risk_level = 7;
            zoneData.reason = 'User-defined danger zone';
        }

        const { data: zone, error } = await supabase
            .from(tableName)
            .insert(zoneData)
            .select()
            .single();

        if (error) {
            console.error('Error creating zone:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `${zone_type === 'safe' ? 'Safe' : 'Danger'} zone created`,
            data: zone,
        });
    } catch (error: any) {
        console.error('Error in POST /api/zones/create:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
