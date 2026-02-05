import { NextRequest, NextResponse } from 'next/server';
import { createEvent, getEvents, type CreateEventParams, type GetEventsParams } from '@/lib/events';

/**
 * POST /api/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.user_id || !body.event_type || !body.severity) {
            return NextResponse.json(
                { error: 'Missing required fields: user_id, event_type, severity' },
                { status: 400 }
            );
        }

        const params: CreateEventParams = {
            user_id: body.user_id,
            event_type: body.event_type,
            severity: body.severity,
            event_data: body.event_data || {},
            location: body.location,
        };

        const { data, error } = await createEvent(params);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/events:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/events
 * Query events with filters
 * Query params: user_id, event_type, severity, limit, from_date, to_date
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params: GetEventsParams = {
            user_id: searchParams.get('user_id') || undefined,
            event_type: searchParams.get('event_type') as any || undefined,
            severity: searchParams.get('severity') as any || undefined,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
            from_date: searchParams.get('from_date') ? new Date(searchParams.get('from_date')!) : undefined,
            to_date: searchParams.get('to_date') ? new Date(searchParams.get('to_date')!) : undefined,
        };

        const { data, error } = await getEvents(params);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/events:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
