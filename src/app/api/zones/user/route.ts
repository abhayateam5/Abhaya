import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/zones/user
 * Get current user's personal zones
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's safe zones
        const { data: safeZones, error: safeError } = await supabase
            .from('safe_zones')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_personal', true)
            .eq('is_active', true);

        if (safeError) {
            console.error('Error fetching safe zones:', safeError);
        }

        // Get user's risk zones
        const { data: riskZones, error: riskError } = await supabase
            .from('risk_zones')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_personal', true)
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
