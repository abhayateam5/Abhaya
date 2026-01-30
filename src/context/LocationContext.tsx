'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { LOCATION_UPDATE_INTERVAL } from '@/lib/constants';

interface Position {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    timestamp: Date;
}

interface LocationContextType {
    position: Position | null;
    isTracking: boolean;
    error: string | null;
    startTracking: () => void;
    stopTracking: () => void;
    getCurrentPosition: () => Promise<Position>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [position, setPosition] = useState<Position | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const updateServerLocation = useCallback(async (pos: Position) => {
        try {
            await fetch('/api/location/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: pos.latitude,
                    longitude: pos.longitude,
                    accuracy: pos.accuracy,
                    altitude: pos.altitude,
                    speed: pos.speed,
                    heading: pos.heading,
                }),
            });
        } catch (err) {
            console.error('Failed to update server location:', err);
        }
    }, []);

    const handlePositionUpdate = useCallback((pos: GeolocationPosition) => {
        const newPosition: Position = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude || undefined,
            speed: pos.coords.speed || undefined,
            heading: pos.coords.heading || undefined,
            timestamp: new Date(pos.timestamp),
        };
        setPosition(newPosition);
        setError(null);
        updateServerLocation(newPosition);
    }, [updateServerLocation]);

    const handleError = useCallback((err: GeolocationPositionError) => {
        let errorMessage: string;
        switch (err.code) {
            case err.PERMISSION_DENIED:
                errorMessage = 'Location permission denied';
                break;
            case err.POSITION_UNAVAILABLE:
                errorMessage = 'Location unavailable';
                break;
            case err.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            default:
                errorMessage = 'Unknown location error';
        }
        setError(errorMessage);
    }, []);

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }

        setIsTracking(true);
        setError(null);

        // Initial position
        navigator.geolocation.getCurrentPosition(handlePositionUpdate, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });

        // Watch position
        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionUpdate,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
            }
        );

        // Periodic server updates
        intervalRef.current = setInterval(() => {
            if (position) {
                updateServerLocation(position);
            }
        }, LOCATION_UPDATE_INTERVAL);
    }, [handlePositionUpdate, handleError, position, updateServerLocation]);

    const stopTracking = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsTracking(false);
    }, []);

    const getCurrentPosition = useCallback((): Promise<Position> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPosition: Position = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        altitude: pos.coords.altitude || undefined,
                        speed: pos.coords.speed || undefined,
                        heading: pos.coords.heading || undefined,
                        timestamp: new Date(pos.timestamp),
                    };
                    setPosition(newPosition);
                    resolve(newPosition);
                },
                (err) => {
                    handleError(err);
                    reject(err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    }, [handleError]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, [stopTracking]);

    return (
        <LocationContext.Provider
            value={{
                position,
                isTracking,
                error,
                startTracking,
                stopTracking,
                getCurrentPosition,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
