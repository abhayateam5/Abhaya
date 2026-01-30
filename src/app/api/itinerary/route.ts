import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Itinerary } from '@/models';
import { getSession, generateId } from '@/lib/auth';
import type { ApiResponse } from '@/types';

// GET - Get user's itineraries
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode
            return NextResponse.json<ApiResponse>({
                success: true,
                data: [
                    {
                        _id: 'mock-itinerary-1',
                        userId: session.userId,
                        title: 'Golden Triangle Tour',
                        destinations: [
                            {
                                id: 'dest-1',
                                name: 'Delhi',
                                address: 'New Delhi, India',
                                location: { latitude: 28.6139, longitude: 77.2090 },
                                arrivalDate: new Date(),
                                departureDate: new Date(Date.now() + 86400000 * 2),
                                notes: 'Visit Red Fort, Qutub Minar',
                            },
                            {
                                id: 'dest-2',
                                name: 'Agra',
                                address: 'Agra, Uttar Pradesh',
                                location: { latitude: 27.1767, longitude: 78.0081 },
                                arrivalDate: new Date(Date.now() + 86400000 * 2),
                                departureDate: new Date(Date.now() + 86400000 * 4),
                                notes: 'Taj Mahal at sunrise',
                            },
                            {
                                id: 'dest-3',
                                name: 'Jaipur',
                                address: 'Jaipur, Rajasthan',
                                location: { latitude: 26.9124, longitude: 75.7873 },
                                arrivalDate: new Date(Date.now() + 86400000 * 4),
                                departureDate: new Date(Date.now() + 86400000 * 6),
                                notes: 'Amber Fort, Hawa Mahal',
                            },
                        ],
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 86400000 * 6),
                        isActive: true,
                        createdAt: new Date(Date.now() - 86400000),
                    },
                ],
            });
        }

        const itineraries = await Itinerary.find({ userId: session.userId }).sort({ createdAt: -1 });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: itineraries,
        });
    } catch (error) {
        console.error('Itinerary fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new itinerary
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, destinations, startDate, endDate } = body;

        if (!title || !destinations || destinations.length === 0) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Title and at least one destination are required' },
                { status: 400 }
            );
        }

        // Add IDs to destinations if not present
        const processedDestinations = destinations.map((dest: Record<string, unknown>) => ({
            ...dest,
            id: dest.id || generateId(),
        }));

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode
            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    _id: `mock-itinerary-${Date.now()}`,
                    userId: session.userId,
                    title,
                    destinations: processedDestinations,
                    startDate,
                    endDate,
                    isActive: true,
                    createdAt: new Date(),
                },
                message: 'Itinerary created (mock mode)',
            });
        }

        // Deactivate other itineraries
        await Itinerary.updateMany({ userId: session.userId }, { isActive: false });

        // Create new itinerary
        const itinerary = await Itinerary.create({
            userId: session.userId,
            title,
            destinations: processedDestinations,
            startDate,
            endDate,
            isActive: true,
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: itinerary,
            message: 'Itinerary created successfully',
        });
    } catch (error) {
        console.error('Itinerary creation error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
