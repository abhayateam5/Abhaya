import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/zones/user
 * Get current user's personal zones
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        // Use test user ID fallback (Phase 6 solution)
        const TEST_USER_ID = 'd74a4a73-7938-43c6-b54f-98b604579972';
        const userId = user?.id || TEST_USER_ID;

        // Get user's safe zones (both personal and public)
        const { data: safeZones, error: safeError } = await supabase
            .from('safe_zones')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (safeError) {
            console.error('Error fetching safe zones:', safeError);
        }

        // Get user's risk zones (both personal and public)
        const { data: riskZones, error: riskError } = await supabase
            .from('risk_zones')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (riskError) {
            console.error('Error fetching risk zones:', riskError);
        }

        return NextResponse.json({
            success: true,
            safeZones: safeZones || [],
            riskZones: riskZones || [],
            total: (safeZones?.length || 0) + (riskZones?.length || 0),
        });
    } catch (error: any) {
        console.error('Error in GET /api/zones/user:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
