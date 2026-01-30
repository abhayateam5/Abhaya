import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Alert, Location } from '@/models';
import { getSession } from '@/lib/auth';
import type { ApiResponse, HeatmapData, HeatmapZone } from '@/types';

// GET - Get heatmap data (police only)
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
        const timeRange = parseInt(searchParams.get('hours') || '24');

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode - return sample heatmap data
            return NextResponse.json<ApiResponse<HeatmapData>>({
                success: true,
                data: {
                    zones: generateMockHeatmapZones(),
                    lastUpdated: new Date(),
                },
            });
        }

        // Get data from last X hours
        const since = new Date(Date.now() - timeRange * 3600000);

        // Aggregate location data by area (simplified clustering)
        const zones = await generateHeatmapFromData(since);

        return NextResponse.json<ApiResponse<HeatmapData>>({
            success: true,
            data: {
                zones,
                lastUpdated: new Date(),
            },
        });
    } catch (error) {
        console.error('Heatmap fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Generate heatmap zones from real data
async function generateHeatmapFromData(since: Date): Promise<HeatmapZone[]> {
    // In production, would use MongoDB's geo aggregation
    // For now, return mock data
    return generateMockHeatmapZones();
}

// Generate mock heatmap zones
function generateMockHeatmapZones(): HeatmapZone[] {
    const zones = [
        {
            id: 'zone-1',
            name: 'Connaught Place',
            center: { latitude: 28.6328, longitude: 77.2195 },
            radius: 500,
            riskLevel: 'low' as const,
            touristCount: 234,
            incidentCount: 2,
            patrolCount: 4,
        },
        {
            id: 'zone-2',
            name: 'India Gate',
            center: { latitude: 28.6129, longitude: 77.2295 },
            radius: 400,
            riskLevel: 'low' as const,
            touristCount: 456,
            incidentCount: 1,
            patrolCount: 3,
        },
        {
            id: 'zone-3',
            name: 'Chandni Chowk',
            center: { latitude: 28.6506, longitude: 77.2303 },
            radius: 600,
            riskLevel: 'medium' as const,
            touristCount: 189,
            incidentCount: 5,
            patrolCount: 2,
        },
        {
            id: 'zone-4',
            name: 'Paharganj',
            center: { latitude: 28.6442, longitude: 77.2131 },
            radius: 350,
            riskLevel: 'high' as const,
            touristCount: 78,
            incidentCount: 8,
            patrolCount: 1,
        },
        {
            id: 'zone-5',
            name: 'Karol Bagh',
            center: { latitude: 28.6514, longitude: 77.1907 },
            radius: 450,
            riskLevel: 'medium' as const,
            touristCount: 112,
            incidentCount: 3,
            patrolCount: 2,
        },
        {
            id: 'zone-6',
            name: 'Rajpath',
            center: { latitude: 28.6143, longitude: 77.2090 },
            radius: 700,
            riskLevel: 'low' as const,
            touristCount: 567,
            incidentCount: 0,
            patrolCount: 5,
        },
    ];

    return zones;
}
