import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/sos/active
 * Get all active SOS events (for police dashboard)
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get active SOS events
        const { data: sosEvents, error } = await supabase
            .from('sos_events')
            .select(`
                id,
                user_id,
                user_name,
                user_phone,
                trigger_mode,
                status,
                priority,
                location,
                address,
                description,
                confidence_score,
                escalation_level,
                created_at,
                acknowledged_by,
                acknowledged_at
            `)
            .in('status', ['triggered', 'acknowledged', 'responding'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching active SOS:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: sosEvents?.length || 0,
            data: sosEvents || [],
        });
    } catch (error: any) {
        console.error('Error in GET /api/sos/active:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
