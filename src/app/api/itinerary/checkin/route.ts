import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/itinerary/checkin
 * Check in at a checkpoint
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { checkpoint_id, lat, lng } = body;

        if (!checkpoint_id) {
            return NextResponse.json(
                { error: 'Missing checkpoint_id' },
                { status: 400 }
            );
        }

        // Update checkpoint status
        const { data: checkpoint, error } = await supabase
            .from('checkpoints')
            .update({
                status: 'checked_in',
                checked_in_at: new Date().toISOString(),
            })
            .eq('id', checkpoint_id)
            .select()
            .single();

        if (error) {
            console.error('Error checking in:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Log user activity
        if (lat && lng) {
            await supabase.rpc('log_user_activity', {
                p_user_id: user.id,
                p_activity_type: 'checkin',
                p_lat: parseFloat(lat),
                p_lng: parseFloat(lng),
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Checked in successfully',
            data: checkpoint,
        });
    } catch (error: any) {
        console.error('Error in POST /api/itinerary/checkin:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
