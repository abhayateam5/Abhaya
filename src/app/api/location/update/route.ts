import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Location, User } from '@/models';
import { getSession } from '@/lib/auth';
import type { ApiResponse, LocationUpdate } from '@/types';

// POST - Update user location
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body: LocationUpdate = await request.json();
        const { latitude, longitude, accuracy, altitude, speed, heading, batteryLevel } = body;

        if (!latitude || !longitude) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Latitude and longitude are required' },
                { status: 400 }
            );
        }

        const db = await connectToDatabase();

        // Determine safety level based on location (simplified mock logic)
        const safetyLevel = determineSafetyLevel(latitude, longitude);

        if (!db) {
            // Mock mode
            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    userId: session.userId,
                    location: { type: 'Point', coordinates: [longitude, latitude] },
                    accuracy,
                    altitude,
                    speed,
                    heading,
                    batteryLevel,
                    safetyLevel,
                    inSafeZone: safetyLevel === 'safe',
                    timestamp: new Date(),
                },
                message: 'Location updated (mock mode)',
            });
        }

        // Create location record
        const locationRecord = await Location.create({
            userId: session.userId,
            userType: session.role === 'police' ? 'police' : 'tourist',
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
            accuracy,
            altitude,
            speed,
            heading,
            batteryLevel,
            safetyLevel,
            inSafeZone: safetyLevel === 'safe',
            timestamp: new Date(),
        });

        // Update user's last active
        await User.findByIdAndUpdate(session.userId, { lastActive: new Date() });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: locationRecord,
            message: 'Location updated successfully',
        });
    } catch (error) {
        console.error('Location update error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - Get location history
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode - return sample history
            return NextResponse.json<ApiResponse>({
                success: true,
                data: generateMockLocationHistory(),
            });
        }

        const locations = await Location.find({ userId: session.userId })
            .sort({ timestamp: -1 })
            .limit(limit);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: locations,
        });
    } catch (error) {
        console.error('Location history fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to determine safety level
function determineSafetyLevel(lat: number, lng: number): 'safe' | 'caution' | 'danger' {
    // This is simplified mock logic - in production, would check against geo-fences
    // For demo, random distribution weighted towards safe
    const random = Math.random();
    if (random > 0.2) return 'safe';
    if (random > 0.05) return 'caution';
    return 'danger';
}

// Generate mock location history
function generateMockLocationHistory() {
    const history = [];
    const baseTime = Date.now();
    const baseLat = 28.6139; // Delhi
    const baseLng = 77.2090;

    for (let i = 0; i < 10; i++) {
        history.push({
            _id: `mock-loc-${i}`,
            location: {
                type: 'Point',
                coordinates: [baseLng + (Math.random() - 0.5) * 0.01, baseLat + (Math.random() - 0.5) * 0.01],
            },
            safetyLevel: i % 5 === 0 ? 'caution' : 'safe',
            inSafeZone: i % 5 !== 0,
            timestamp: new Date(baseTime - i * 3600000),
        });
    }

    return history;
}
