import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SafetyScore, User } from '@/models';
import { getSession } from '@/lib/auth';
import { SAFETY_WEIGHTS, SAFETY_THRESHOLDS } from '@/lib/constants';
import { isNightTime } from '@/lib/utils';
import type { ApiResponse, SafetyFactors } from '@/types';

// GET - Calculate and return current safety score
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Calculate safety factors (simulated for demo)
        const factors = calculateSafetyFactors();

        // Calculate weighted score
        const score = Math.round(
            factors.locationSafety * SAFETY_WEIGHTS.locationSafety +
            factors.timeOfDay * SAFETY_WEIGHTS.timeOfDay +
            factors.crowdDensity * SAFETY_WEIGHTS.crowdDensity +
            factors.weatherConditions * SAFETY_WEIGHTS.weatherConditions +
            factors.networkConnectivity * SAFETY_WEIGHTS.networkConnectivity +
            factors.routeCompliance * SAFETY_WEIGHTS.routeCompliance
        );

        // Determine level
        const level = getScoreLevel(score);

        const db = await connectToDatabase();

        const safetyData = {
            userId: session.userId,
            score,
            factors,
            level,
            timestamp: new Date(),
        };

        if (!db) {
            // Mock mode
            return NextResponse.json<ApiResponse>({
                success: true,
                data: safetyData,
            });
        }

        // Store score in history
        await SafetyScore.create(safetyData);

        // Update user's safety score
        await User.findByIdAndUpdate(session.userId, { safetyScore: score });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: safetyData,
        });
    } catch (error) {
        console.error('Safety score calculation error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Calculate safety factors (simulated)
function calculateSafetyFactors(): SafetyFactors {
    // In production, these would come from:
    // - locationSafety: Geo-fence zone data
    // - timeOfDay: Current time analysis
    // - crowdDensity: Real-time crowd data
    // - weatherConditions: Weather API
    // - networkConnectivity: Device signal strength
    // - routeCompliance: Comparison with planned itinerary

    const nightPenalty = isNightTime() ? -15 : 0;

    return {
        locationSafety: Math.min(100, Math.max(0, 75 + Math.random() * 20)),
        timeOfDay: Math.min(100, Math.max(0, 85 + nightPenalty + Math.random() * 10)),
        crowdDensity: Math.min(100, Math.max(0, 70 + Math.random() * 25)),
        weatherConditions: Math.min(100, Math.max(0, 80 + Math.random() * 15)),
        networkConnectivity: Math.min(100, Math.max(0, 85 + Math.random() * 15)),
        routeCompliance: Math.min(100, Math.max(0, 90 + Math.random() * 10)),
    };
}

// Get score level based on thresholds
function getScoreLevel(score: number): 'excellent' | 'good' | 'moderate' | 'low' | 'critical' {
    if (score >= SAFETY_THRESHOLDS.excellent) return 'excellent';
    if (score >= SAFETY_THRESHOLDS.good) return 'good';
    if (score >= SAFETY_THRESHOLDS.moderate) return 'moderate';
    if (score >= SAFETY_THRESHOLDS.low) return 'low';
    return 'critical';
}
