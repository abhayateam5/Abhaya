import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/safety-score/history
 * Get user's safety score history
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        // Use test user ID fallback
        const TEST_USER_ID = 'd74a4a73-7938-43c6-b54f-98b604579972';
        const userId = user?.id || TEST_USER_ID;

        // Get query params
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7', 10);

        // Fetch score history
        const { data: history, error } = await supabase
            .from('safety_score_history')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching score history:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: history?.length || 0,
            data: history || [],
        });
    } catch (error: any) {
        console.error('Error in GET /api/safety-score/history:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
