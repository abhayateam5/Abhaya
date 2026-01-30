import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Alert } from '@/models';
import { getSession } from '@/lib/auth';
import type { ApiResponse, Alert as AlertType } from '@/types';

// GET - Get all active alerts (police only)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'police') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'active';
        const priority = searchParams.get('priority');

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode - return sample alerts
            const mockAlerts = generateMockAlerts();
            return NextResponse.json<ApiResponse>({
                success: true,
                data: mockAlerts.filter((a) =>
                    (status === 'all' || a.status === status) &&
                    (!priority || a.priority === priority)
                ),
            });
        }

        const query: Record<string, unknown> = {};
        if (status !== 'all') {
            query.status = status;
        }
        if (priority) {
            query.priority = priority;
        }

        const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(50);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: alerts,
        });
    } catch (error) {
        console.error('Alerts fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update alert status (police only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'police') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { alertId, status, resolutionNotes } = body;

        if (!alertId || !status) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Alert ID and status are required' },
                { status: 400 }
            );
        }

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode
            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    _id: alertId,
                    status,
                    resolutionNotes,
                    respondingOfficerId: session.userId,
                    respondingOfficerName: session.name,
                    responseTime: new Date(),
                },
                message: 'Alert updated (mock mode)',
            });
        }

        const alert = await Alert.findByIdAndUpdate(
            alertId,
            {
                status,
                resolutionNotes,
                respondingOfficerId: session.userId,
                respondingOfficerName: session.name,
                responseTime: status === 'responding' ? new Date() : undefined,
                resolutionTime: status === 'resolved' ? new Date() : undefined,
            },
            { new: true }
        );

        if (!alert) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Alert not found' },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: alert,
            message: 'Alert updated successfully',
        });
    } catch (error) {
        console.error('Alert update error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Generate mock alerts for demo
function generateMockAlerts(): Partial<AlertType>[] {
    const types = ['sos', 'geofence', 'anomaly', 'silent'] as const;
    const priorities = ['critical', 'high', 'medium', 'low'] as const;
    const statuses = ['active', 'responding', 'resolved'] as const;

    const locations = [
        { name: 'Connaught Place, Delhi', coords: [77.2195, 28.6328] },
        { name: 'India Gate, Delhi', coords: [77.2295, 28.6129] },
        { name: 'Taj Mahal, Agra', coords: [78.0421, 27.1751] },
        { name: 'Amber Fort, Jaipur', coords: [75.8513, 26.9855] },
        { name: 'Gateway of India, Mumbai', coords: [72.8347, 18.9220] },
    ];

    return Array.from({ length: 5 }, (_, i) => {
        const loc = locations[i % locations.length];
        return {
            _id: `mock-alert-${i}`,
            type: types[i % types.length],
            status: i < 2 ? 'active' : statuses[i % statuses.length],
            priority: i === 0 ? 'critical' : priorities[i % priorities.length],
            touristId: `mock-tourist-${i}`,
            touristName: `Tourist ${i + 1}`,
            touristPhone: `+91 987654321${i}`,
            location: {
                type: 'Point' as const,
                coordinates: loc.coords as [number, number],
            },
            address: loc.name,
            description: `${types[i % types.length].toUpperCase()} alert triggered`,
            createdAt: new Date(Date.now() - i * 1800000),
        };
    });
}
