import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Alert } from '@/models';
import { getSession } from '@/lib/auth';
import type { ApiResponse } from '@/types';

// PUT - Cancel/Update SOS alert
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { status, resolutionNotes } = body;

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode
            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    _id: id,
                    status: status || 'resolved',
                    resolutionNotes: resolutionNotes || 'Alert resolved',
                    resolutionTime: new Date(),
                },
                message: 'Alert updated (mock mode)',
            });
        }

        const alert = await Alert.findById(id);
        if (!alert) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Alert not found' },
                { status: 404 }
            );
        }

        // Verify ownership (tourist can only cancel their own alerts)
        if (session.role === 'tourist' && alert.touristId.toString() !== session.userId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Update alert
        alert.status = status || 'false_alarm';
        alert.resolutionNotes = resolutionNotes;
        alert.resolutionTime = new Date();
        await alert.save();

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
