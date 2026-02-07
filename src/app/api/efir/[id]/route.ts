import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/efir/[id]
 * Get e-FIR details with evidence
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const efirId = params.id;

        const { data: efir, error } = await supabase
            .from('e_firs')
            .select('*, evidence_files(*)')
            .eq('id', efirId)
            .single();

        if (error) {
            console.error('Error fetching e-FIR:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!efir) {
            return NextResponse.json({ error: 'e-FIR not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: efir,
        });
    } catch (error: any) {
        console.error('Error in GET /api/efir/[id]:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/efir/[id]
 * Update e-FIR (submit, etc.)
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

        const efirId = params.id;
        const body = await request.json();
        const { status } = body;

        const updateData: any = { status };

        if (status === 'submitted') {
            updateData.submitted_at = new Date().toISOString();
        }

        const { data: efir, error } = await supabase
            .from('e_firs')
            .update(updateData)
            .eq('id', efirId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating e-FIR:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'e-FIR updated successfully',
            data: efir,
        });
    } catch (error: any) {
        console.error('Error in PUT /api/efir/[id]:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
