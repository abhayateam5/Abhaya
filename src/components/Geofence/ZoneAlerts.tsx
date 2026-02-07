'use client';

import { useState, useEffect } from 'react';

interface Alert {
    id: string;
    zone_name: string;
    alert_type: 'entry' | 'exit' | 'proximity' | 'warning';
    message: string;
    severity: 'info' | 'warning' | 'danger';
    created_at: string;
    is_read: boolean;
}

export default function ZoneAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        // Get current location and check zones
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCurrentLocation(newLocation);
                    checkZones(newLocation.lat, newLocation.lng);
                },
                (error) => console.error('Geolocation error:', error),
                { enableHighAccuracy: true, maximumAge: 10000 }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const checkZones = async (lat: number, lng: number) => {
        try {
            const response = await fetch('/api/zones/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng }),
            });

            const data = await response.json();

            if (data.success) {
                // Create alerts for zone entries
                if (data.inSafeZone) {
                    const safeZone = data.safeZones[0];
                    addAlert({
                        id: Date.now().toString(),
                        zone_name: safeZone.zone_name,
                        alert_type: 'entry',
                        message: `Entered safe zone: ${safeZone.zone_name}`,
                        severity: 'info',
                        created_at: new Date().toISOString(),
                        is_read: false,
                    });
                }

                if (data.inRiskZone) {
                    const riskZone = data.riskZones[0];
                    addAlert({
                        id: Date.now().toString(),
                        zone_name: riskZone.zone_name,
                        alert_type: 'warning',
                        message: `⚠️ Entered danger zone: ${riskZone.zone_name}`,
                        severity: 'danger',
                        created_at: new Date().toISOString(),
                        is_read: false,
                    });
                }
            }
        } catch (error) {
            console.error('Error checking zones:', error);
        }
    };

    const addAlert = (alert: Alert) => {
        // Avoid duplicate alerts
        if (!alerts.some((a) => a.zone_name === alert.zone_name && a.alert_type === alert.alert_type)) {
            setAlerts((prev) => [alert, ...prev].slice(0, 5)); // Keep last 5 alerts
        }
    };

    const dismissAlert = (id: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Zone Alerts</h3>

            {currentLocation && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <p className="text-blue-800">
                        📍 Monitoring location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                </div>
            )}

            {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No alerts yet</p>
            ) : (
                <div className="space-y-2">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-3 rounded-lg border-l-4 ${alert.severity === 'danger'
                                    ? 'bg-red-50 border-red-500'
                                    : alert.severity === 'warning'
                                        ? 'bg-yellow-50 border-yellow-500'
                                        : 'bg-green-50 border-green-500'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-gray-800">{alert.message}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {new Date(alert.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => dismissAlert(alert.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
