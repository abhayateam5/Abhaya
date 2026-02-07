'use client';

import { useState, useEffect } from 'react';

interface Anomaly {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    created_at: string;
}

export default function AnomalyAlerts() {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);

    const detectAnomalies = async () => {
        setIsDetecting(true);
        try {
            // Get current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const response = await fetch('/api/anomaly/detect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            speed: position.coords.speed ? (position.coords.speed * 3.6) : 0, // m/s to km/h
                            battery_level: 50, // Mock battery level
                        }),
                    });

                    const data = await response.json();
                    if (data.success && data.anomalies) {
                        setAnomalies(data.anomalies);

                        if (data.sos_triggered) {
                            alert('🚨 Critical anomaly detected! SOS auto-triggered!');
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error detecting anomalies:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 border-red-500 text-red-800';
            case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
            case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
            default: return 'bg-blue-100 border-blue-500 text-blue-800';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🚨';
            case 'high': return '⚠️';
            case 'medium': return '⚡';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Anomaly Detection</h3>
                <button
                    onClick={detectAnomalies}
                    disabled={isDetecting}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDetecting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isDetecting ? 'Detecting...' : '🔍 Detect Now'}
                </button>
            </div>

            {anomalies.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    No anomalies detected. Click "Detect Now" to check.
                </p>
            ) : (
                <div className="space-y-3">
                    {anomalies.map((anomaly, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${getSeverityColor(anomaly.severity)}`}
                        >
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">{getSeverityIcon(anomaly.severity)}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold capitalize">
                                                {anomaly.type.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm mt-1">{anomaly.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${anomaly.severity === 'critical' ? 'bg-red-200' :
                                                anomaly.severity === 'high' ? 'bg-orange-200' :
                                                    anomaly.severity === 'medium' ? 'bg-yellow-200' : 'bg-blue-200'
                                            }`}>
                                            {anomaly.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p className="font-semibold mb-1">Detected Anomalies:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Inactivity (30min+)</li>
                    <li>Route deviation (>2km)</li>
                    <li>Speed anomaly</li>
                    <li>GPS signal loss</li>
                    <li>Unusual hours (2-5 AM)</li>
                    <li>Low battery</li>
                </ul>
            </div>
        </div>
    );
}
