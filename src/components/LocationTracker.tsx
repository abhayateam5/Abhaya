'use client';

import { useEffect, useState } from 'react';
import {
    startTracking,
    stopTracking,
    updateLocation,
    syncOfflineLocations,
    type TrackingMode,
    type LocationData,
} from '@/lib/location';
import { useAuth } from '@/components/providers/AuthProvider';

interface LocationTrackerProps {
    mode?: TrackingMode;
    enabled?: boolean;
    onLocationUpdate?: (location: LocationData) => void;
}

export default function LocationTracker({
    mode = 'balanced',
    enabled = true,
    onLocationUpdate,
}: LocationTrackerProps) {
    const { user } = useAuth();
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !enabled) {
            if (isTracking) {
                stopTracking();
                setIsTracking(false);
            }
            return;
        }

        // Request geolocation permission
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }

        // Start tracking
        const handleLocationUpdate = async (location: LocationData) => {
            // Update server
            await updateLocation(location, mode);

            // Call callback if provided
            if (onLocationUpdate) {
                onLocationUpdate(location);
            }
        };

        startTracking(mode, handleLocationUpdate);
        setIsTracking(true);

        // Sync offline locations when coming online
        if (navigator.onLine) {
            syncOfflineLocations();
        }

        // Cleanup
        return () => {
            stopTracking();
            setIsTracking(false);
        };
    }, [user, enabled, mode]);

    // This component doesn't render anything
    return null;
}
