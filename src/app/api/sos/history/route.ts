import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/sos/history
 * Get SOS history for current user
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's SOS history
        const { data: sosHistory, error } = await supabase
            .from('sos_events')
            .select(`
                id,
                trigger_mode,
                status,
                priority,
                address,
                description,
                confidence_score,
                created_at,
                resolution_time
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching SOS history:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: sosHistory?.length || 0,
            data: sosHistory || [],
        });
    } catch (error: any) {
        console.error('Error in GET /api/sos/history:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
