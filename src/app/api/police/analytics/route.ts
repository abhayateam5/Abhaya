import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Alert, User, Location } from '@/models';
import { getSession } from '@/lib/auth';
import type { ApiResponse, DashboardStats } from '@/types';

// GET - Get dashboard analytics (police only)
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'police') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode - return sample analytics
            return NextResponse.json<ApiResponse<DashboardStats>>({
                success: true,
                data: {
                    totalTourists: 1717,
                    activeSOS: 2,
                    activePatrols: 12,
                    averageSafetyScore: 78,
                    incidentsToday: 14,
                    highRiskZones: 3,
                },
            });
        }

        // Calculate real stats
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [totalTourists, activeSOS, activePolice, incidentsToday, avgScoreResult] = await Promise.all([
            User.countDocuments({ role: 'tourist', isActive: true }),
            Alert.countDocuments({ status: 'active' }),
            User.countDocuments({ role: 'police', isActive: true }),
            Alert.countDocuments({ createdAt: { $gte: startOfDay } }),
            User.aggregate([
                { $match: { role: 'tourist' } },
                { $group: { _id: null, avgScore: { $avg: '$safetyScore' } } },
            ]),
        ]);

        const averageSafetyScore = avgScoreResult[0]?.avgScore || 75;

        // Count high risk zones (simplified - would use geo analysis in production)
        const highRiskAlerts = await Alert.countDocuments({
            status: 'active',
            priority: { $in: ['critical', 'high'] },
        });

        return NextResponse.json<ApiResponse<DashboardStats>>({
            success: true,
            data: {
                totalTourists,
                activeSOS,
                activePatrols: activePolice,
                averageSafetyScore: Math.round(averageSafetyScore),
                incidentsToday,
                highRiskZones: Math.min(highRiskAlerts, 5),
            },
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
