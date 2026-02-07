import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';
import { calculateSafetyScore, type SafetyScoreBreakdown } from '@/lib/safetyScore';

/**
 * POST /api/safety-score/calculate
 * Calculate current safety score for user
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        // Use test user ID fallback
        const TEST_USER_ID = 'd74a4a73-7938-43c6-b54f-98b604579972';
        const userId = user?.id || TEST_USER_ID;

        const body = await request.json();
        const { location, batteryLevel } = body;

        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
        }

        if (typeof batteryLevel !== 'number' || batteryLevel < 0 || batteryLevel > 100) {
            return NextResponse.json({ error: 'Invalid battery level' }, { status: 400 });
        }

        // Get location score from database
        const { data: locationScoreData, error: locationError } = await supabase
            .rpc('get_location_safety_score', {
                p_lat: location.lat,
                p_lng: location.lng,
                p_radius_meters: 1000
            });

        if (locationError) {
            console.error('Location score error:', locationError);
        }

        // Get recent incidents score from database
        const { data: incidentScoreData, error: incidentError } = await supabase
            .rpc('get_recent_incidents_score', {
                p_lat: location.lat,
                p_lng: location.lng,
                p_radius_meters: 1000,
                p_days: 7
            });

        if (incidentError) {
            console.error('Incident score error:', incidentError);
        }

        // Get user behavior score from database
        const { data: behaviorScoreData, error: behaviorError } = await supabase
            .rpc('get_user_behavior_score', {
                p_user_id: userId
            });

        if (behaviorError) {
            console.error('Behavior score error:', behaviorError);
        }

        // Calculate time of day score locally (so it actually changes!)
        const hour = new Date().getHours();
        let timeScore = 100;
        if (hour >= 6 && hour < 18) {
            timeScore = 100; // Daytime
        } else if (hour >= 18 && hour < 22) {
            timeScore = 75; // Evening
        } else if (hour >= 22 || hour < 2) {
            timeScore = 50; // Late night
        } else {
            timeScore = 25; // Early morning
        }

        // Use database scores or fallback to defaults
        const locationScore = locationScoreData ?? 75;
        const incidentScore = incidentScoreData ?? 90;
        const behaviorScore = behaviorScoreData ?? 80;

        // Calculate battery score locally
        let batteryScore = 100;
        if (batteryLevel <= 50) batteryScore = 70;
        if (batteryLevel <= 20) batteryScore = 40;
        if (batteryLevel < 10) batteryScore = 10;

        console.log('=== SAFETY SCORE CALCULATION ===');
        console.log('Location Score:', locationScore, '(40% weight)');
        console.log('Time Score:', timeScore, `(15% weight) - Hour: ${hour}`);
        console.log('Incident Score:', incidentScore, '(20% weight)');
        console.log('Behavior Score:', behaviorScore, '(15% weight)');
        console.log('Battery Score:', batteryScore, `(10% weight) - Level: ${batteryLevel}%`);

        // Calculate weighted composite score
        const composite = Math.round(
            locationScore * 0.40 +
            timeScore * 0.15 +
            incidentScore * 0.20 +
            behaviorScore * 0.15 +
            batteryScore * 0.10
        );

        console.log('Composite Score:', composite);
        console.log('================================');

        const scoreBreakdown: SafetyScoreBreakdown = {
            composite,
            location: locationScore,
            timeOfDay: timeScore,
            recentIncidents: incidentScore,
            userBehavior: behaviorScore,
            battery: batteryScore,
        };

        // Save to history
        const { error: historyError } = await supabase
            .from('safety_score_history')
            .insert({
                user_id: userId,
                composite_score: composite,
                location_score: locationScore,
                time_score: timeScore,
                incident_score: incidentScore,
                behavior_score: behaviorScore,
                battery_score: batteryScore,
                location: `POINT(${location.lng} ${location.lat})`,
                battery_level: batteryLevel,
            });

        if (historyError) {
            console.error('Error saving score history:', historyError);
        }

        return NextResponse.json({
            success: true,
            data: scoreBreakdown,
        });
    } catch (error: any) {
        console.error('Error in POST /api/safety-score/calculate:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
