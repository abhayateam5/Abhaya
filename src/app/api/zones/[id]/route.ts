import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * DELETE /api/zones/[id]
 * Delete a personal zone
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const zoneId = params.id;

        // Try deleting from safe_zones first
        const { error: safeError } = await supabase
            .from('safe_zones')
            .delete()
            .eq('id', zoneId)
            .eq('user_id', user.id)
            .eq('is_personal', true);

        if (!safeError) {
            return NextResponse.json({
                success: true,
                message: 'Safe zone deleted',
            });
        }

        // Try deleting from risk_zones
        const { error: riskError } = await supabase
            .from('risk_zones')
            .delete()
            .eq('id', zoneId)
            .eq('user_id', user.id)
            .eq('is_personal', true);

        if (!riskError) {
            return NextResponse.json({
                success: true,
                message: 'Risk zone deleted',
            });
        }

        return NextResponse.json(
            { error: 'Zone not found or not authorized' },
            { status: 404 }
        );
    } catch (error: any) {
        console.error('Error in DELETE /api/zones/[id]:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
