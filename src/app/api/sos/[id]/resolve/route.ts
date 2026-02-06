import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * PUT /api/sos/[id]/resolve
 * Resolve an SOS event
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sosId = params.id;
        const body = await request.json();
        const { resolution_notes, is_false_alarm } = body;

        // Update SOS status (only update existing columns)
        const { data: sosEvent, error } = await supabase
            .from('sos_events')
            .update({
                status: is_false_alarm ? 'false_alarm' : 'resolved',
            })
            .eq('id', sosId)
            .select()
            .single();

        if (error) {
            console.error('Error resolving SOS:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If false alarm, increment false_alarm_count for user
        if (is_false_alarm) {
            await supabase.rpc('increment_false_alarm_count', {
                p_user_id: sosEvent.user_id,
            });
        }

        return NextResponse.json({
            success: true,
            message: is_false_alarm ? 'Marked as false alarm' : 'SOS resolved',
            data: sosEvent,
        });
    } catch (error: any) {
        console.error('Error in PUT /api/sos/[id]/resolve:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
