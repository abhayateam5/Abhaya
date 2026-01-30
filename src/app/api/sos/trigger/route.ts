import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Alert } from '@/models';
import { getSession, generateDigitalIdHash } from '@/lib/auth';
import type { ApiResponse, AlertCreateData } from '@/types';

// POST - Trigger SOS alert
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
        const { latitude, longitude, type = 'sos', description } = body;

        if (!latitude || !longitude) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Location is required' },
                { status: 400 }
            );
        }

        const alertData: AlertCreateData = {
            type: type,
            priority: type === 'sos' ? 'critical' : 'high',
            touristId: session.userId,
            touristName: session.name,
            touristPhone: '+91 9876543210', // Would come from profile
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
            description: description || `${type.toUpperCase()} alert triggered`,
        };

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode
            const mockAlert = {
                _id: `mock-alert-${Date.now()}`,
                ...alertData,
                status: 'active',
                blockchainHash: generateDigitalIdHash(session.userId, Date.now()),
                createdAt: new Date(),
            };

            return NextResponse.json<ApiResponse>({
                success: true,
                data: mockAlert,
                message: 'SOS alert triggered successfully (mock mode)',
            });
        }

        // Create alert in database
        const alert = await Alert.create({
            ...alertData,
            status: 'active',
            blockchainHash: generateDigitalIdHash(session.userId, Date.now()),
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: alert,
            message: 'SOS alert triggered successfully',
        });
    } catch (error) {
        console.error('SOS trigger error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - Get SOS history
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
                        _id: 'mock-alert-1',
                        type: 'sos',
                        status: 'resolved',
                        priority: 'critical',
                        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
                        createdAt: new Date(Date.now() - 86400000),
                        resolutionTime: new Date(Date.now() - 86000000),
                    },
                ],
            });
        }

        const alerts = await Alert.find({ touristId: session.userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: alerts,
        });
    } catch (error) {
        console.error('SOS history fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
