import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';
import { detectAllAnomalies, shouldTriggerAutoSOS } from '@/lib/anomaly';

/**
 * POST /api/anomaly/detect
 * Detect anomalies in current state
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { lat, lng, speed, battery_level, travel_mode } = body;

        // Get last activity
        const { data: lastActivityData } = await supabase.rpc('detect_inactivity', {
            p_user_id: user.id,
            p_threshold_minutes: 30,
        });

        const lastActivity = lastActivityData?.[0]?.last_activity
            ? new Date(lastActivityData[0].last_activity)
            : new Date();

        // Get active itinerary for route deviation check
        const { data: itinerary } = await supabase
            .from('itineraries')
            .select('*, destinations(*)')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        const plannedRoute = itinerary?.destinations?.map((d: any) => ({
            lat: d.location.coordinates[1],
            lng: d.location.coordinates[0],
        })) || [];

        // Run anomaly detection
        const anomalies = detectAllAnomalies({
            lastActivity,
            currentLocation: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
            plannedRoute,
            speed: speed ? parseFloat(speed) : undefined,
            travelMode: travel_mode || 'walking',
            lastGPSUpdate: new Date(), // Assume current if we have location
            batteryLevel: battery_level ? parseInt(battery_level) : undefined,
        });

        const shouldTriggerSOS = shouldTriggerAutoSOS(anomalies);

        // Log detected anomalies
        for (const anomaly of anomalies) {
            if (anomaly.detected && anomaly.type) {
                await supabase.from('anomalies').insert({
                    user_id: user.id,
                    itinerary_id: itinerary?.id || null,
                    type: anomaly.type,
                    severity: anomaly.severity,
                    description: anomaly.description,
                    location: lat && lng ? `POINT(${lng} ${lat})` : null,
                    metadata: anomaly.metadata || {},
                    auto_sos_triggered: anomaly.shouldTriggerSOS,
                });
            }
        }

        // Auto-trigger SOS if critical
        let sosId = null;
        if (shouldTriggerSOS) {
            const { data: sos } = await supabase.from('sos_events').insert({
                user_id: user.id,
                trigger_mode: 'anomaly_auto',
                location: lat && lng ? `POINT(${lng} ${lat})` : null,
                description: `Auto-triggered by anomaly: ${anomalies.find(a => a.shouldTriggerSOS)?.description}`,
                confidence_score: 85,
            }).select().single();

            sosId = sos?.id;
        }

        return NextResponse.json({
            success: true,
            anomalies: anomalies.filter(a => a.detected),
            sos_triggered: shouldTriggerSOS,
            sos_id: sosId,
        });
    } catch (error: any) {
        console.error('Error in POST /api/anomaly/detect:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
