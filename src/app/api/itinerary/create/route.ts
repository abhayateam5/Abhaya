import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/itinerary/create
 * Create a new itinerary with checkpoints
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, start_date, end_date, destinations } = body;

        if (!title || !start_date || !end_date) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create itinerary
        const { data: itinerary, error: itineraryError } = await supabase
            .from('itineraries')
            .insert({
                user_id: user.id,
                title,
                start_date,
                end_date,
                is_active: true,
            })
            .select()
            .single();

        if (itineraryError) {
            console.error('Error creating itinerary:', itineraryError);
            return NextResponse.json({ error: itineraryError.message }, { status: 500 });
        }

        // Create destinations if provided
        if (destinations && destinations.length > 0) {
            const destinationsData = destinations.map((dest: any, index: number) => ({
                itinerary_id: itinerary.id,
                name: dest.name,
                address: dest.address || '',
                location: `POINT(${dest.lng} ${dest.lat})`,
                arrival_date: dest.arrival_date,
                departure_date: dest.departure_date,
                notes: dest.notes || null,
                order_index: index,
            }));

            const { error: destError } = await supabase
                .from('destinations')
                .insert(destinationsData);

            if (destError) {
                console.error('Error creating destinations:', destError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Itinerary created',
            data: itinerary,
        });
    } catch (error: any) {
        console.error('Error in POST /api/itinerary/create:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
