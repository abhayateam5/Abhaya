import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/safety-incidents/report
 * Report a safety incident
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        // Use test user ID fallback
        const TEST_USER_ID = 'd74a4a73-7938-43c6-b54f-98b604579972';
        const userId = user?.id || TEST_USER_ID;

        const body = await request.json();
        const { location, incidentType, severity, description, incidentTime } = body;

        // Validation
        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
        }

        if (!incidentType) {
            return NextResponse.json({ error: 'Incident type is required' }, { status: 400 });
        }

        if (!severity) {
            return NextResponse.json({ error: 'Severity is required' }, { status: 400 });
        }

        // Insert incident
        const { data: incident, error } = await supabase
            .from('safety_incidents')
            .insert({
                location: `POINT(${location.lng} ${location.lat})`,
                incident_type: incidentType,
                severity,
                description,
                reported_by: userId,
                incident_time: incidentTime || new Date().toISOString(),
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Error reporting incident:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: incident,
        });
    } catch (error: any) {
        console.error('Error in POST /api/safety-incidents/report:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
