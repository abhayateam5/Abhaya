import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * PUT /api/sos/[id]/acknowledge
 * Police officer acknowledges an SOS event
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

        // Get user profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, name')
            .eq('id', user.id)
            .single();

        // Update SOS status to acknowledged
        const { data: sosEvent, error } = await supabase
            .from('sos_events')
            .update({
                status: 'acknowledged',
                acknowledged_by: user.id,
                acknowledged_at: new Date().toISOString(),
            })
            .eq('id', sosId)
            .select()
            .single();

        if (error) {
            console.error('Error acknowledging SOS:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update escalation record
        await supabase
            .from('sos_escalations')
            .update({
                status: 'acknowledged',
                acknowledged_by: user.id,
                acknowledged_at: new Date().toISOString(),
            })
            .eq('sos_event_id', sosId)
            .eq('status', 'sent');

        return NextResponse.json({
            success: true,
            message: 'SOS acknowledged',
            data: sosEvent,
        });
    } catch (error: any) {
        console.error('Error in PUT /api/sos/[id]/acknowledge:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
