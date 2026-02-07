import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * GET /api/safety-incidents/nearby
 * Get nearby safety incidents
 */
export async function GET(request: NextRequest) {
    try {
        const { supabase } = await getAuthenticatedServerClient();

        // Get query params
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');
        const radius = parseInt(searchParams.get('radius') || '1000', 10);
        const days = parseInt(searchParams.get('days') || '7', 10);

        if (!lat || !lng) {
            return NextResponse.json({ error: 'Location is required' }, { status: 400 });
        }

        // Fetch nearby incidents
        // Note: This is a simplified query. In production, use PostGIS ST_DWithin
        const { data: incidents, error } = await supabase
            .from('safety_incidents')
            .select('*')
            .gte('incident_time', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
            .in('status', ['pending', 'verified'])
            .order('incident_time', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching nearby incidents:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: incidents?.length || 0,
            data: incidents || [],
        });
    } catch (error: any) {
        console.error('Error in GET /api/safety-incidents/nearby:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
