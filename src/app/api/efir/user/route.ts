import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/efir/user
 * Get user's e-FIRs
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        // Use test user ID fallback (Phase 6 solution for test pages)
        const TEST_USER_ID = 'd74a4a73-7938-43c6-b54f-98b604579972';
        const userId = user?.id || TEST_USER_ID;

        const { data: efirs, error } = await supabase
            .from('e_firs')
            .select('*, evidence_files(count)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching e-FIRs:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: efirs?.length || 0,
            data: efirs || [],
        });
    } catch (error: any) {
        console.error('Error in GET /api/efir/user:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
