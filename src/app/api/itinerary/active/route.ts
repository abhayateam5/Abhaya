import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/itinerary/active
 * Get user's active itinerary with progress
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get active itinerary
        const { data: itinerary, error } = await supabase
            .from('itineraries')
            .select(`
                *,
                destinations (
                    *,
                    checkpoints (*)
                )
            `)
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned
            console.error('Error fetching active itinerary:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!itinerary) {
            return NextResponse.json({
                success: true,
                hasActive: false,
                data: null,
            });
        }

        // Calculate progress
        const allCheckpoints = itinerary.destinations?.flatMap((d: any) => d.checkpoints || []) || [];
        const completedCheckpoints = allCheckpoints.filter((c: any) => c.status === 'checked_in');
        const progress = allCheckpoints.length > 0
            ? (completedCheckpoints.length / allCheckpoints.length) * 100
            : 0;

        return NextResponse.json({
            success: true,
            hasActive: true,
            data: {
                ...itinerary,
                progress: Math.round(progress),
                total_checkpoints: allCheckpoints.length,
                completed_checkpoints: completedCheckpoints.length,
            },
        });
    } catch (error: any) {
        console.error('Error in GET /api/itinerary/active:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
