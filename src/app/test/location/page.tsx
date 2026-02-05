'use client';

import { useState, useEffect } from 'react';
import {
    getCurrentLocation,
    startTracking,
    stopTracking,
    updateLocation,
    syncOfflineLocations,
    getOfflineQueueSize,
    type TrackingMode,
    type LocationData,
} from '@/lib/location';
import LocationTracker from '@/components/LocationTracker';
import BatteryManager from '@/components/BatteryManager';

export default function LocationTestPage() {
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [trackingMode, setTrackingMode] = useState<TrackingMode>('balanced');
    const [isTracking, setIsTracking] = useState(false);
    const [offlineQueueSize, setOfflineQueueSize] = useState(0);
    const [batteryLevel, setBatteryLevel] = useState(100);
    const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
    const [stats, setStats] = useState({
        totalUpdates: 0,
        lastUpdate: null as Date | null,
        avgAccuracy: 0,
    });

    // Update offline queue size
    useEffect(() => {
        const interval = setInterval(() => {
            setOfflineQueueSize(getOfflineQueueSize());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Get battery level
    useEffect(() => {
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                setBatteryLevel(battery.level * 100);
                battery.addEventListener('levelchange', () => {
                    setBatteryLevel(battery.level * 100);
                });
            });
        }
    }, []);

    const handleGetCurrentLocation = async () => {
        const { data, error } = await getCurrentLocation(trackingMode);
        if (data) {
            setCurrentLocation(data);
            setLocationHistory((prev) => [data, ...prev].slice(0, 10));
            updateStats(data);
        } else {
            alert(`Error: ${error}`);
        }
    };

    const handleStartTracking = () => {
        setIsTracking(true);
    };

    const handleStopTracking = () => {
        setIsTracking(false);
        stopTracking();
    };

    const handleLocationUpdate = (location: LocationData) => {
        setCurrentLocation(location);
        setLocationHistory((prev) => [location, ...prev].slice(0, 10));
        updateStats(location);
    };

    const handleModeChange = (mode: TrackingMode) => {
        setTrackingMode(mode);
        console.log(`Battery manager changed mode to: ${mode}`);
    };

    const handleSyncOffline = async () => {
        const result = await syncOfflineLocations();
        alert(`Synced ${result.synced} offline locations`);
        setOfflineQueueSize(0);
    };

    const updateStats = (location: LocationData) => {
        setStats((prev) => {
            const totalUpdates = prev.totalUpdates + 1;
            const avgAccuracy =
                (prev.avgAccuracy * prev.totalUpdates + location.accuracy) / totalUpdates;
            return {
                totalUpdates,
                lastUpdate: new Date(),
                avgAccuracy,
            };
        });
    };

    const getModeColor = (mode: TrackingMode) => {
        switch (mode) {
            case 'high_accuracy':
                return 'bg-red-500';
            case 'balanced':
                return 'bg-green-500';
            case 'low_power':
                return 'bg-yellow-500';
            case 'stealth':
                return 'bg-purple-500';
        }
    };

    const getModeInterval = (mode: TrackingMode) => {
        switch (mode) {
            case 'high_accuracy':
                return '5s';
            case 'balanced':
                return '30s';
            case 'low_power':
                return '5min';
            case 'stealth':
                return '10s';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            {/* Background Components */}
            {isTracking && (
                <>
                    <LocationTracker
                        mode={trackingMode}
                        enabled={isTracking}
                        onLocationUpdate={handleLocationUpdate}
                    />
                    <BatteryManager onModeChange={handleModeChange} />
                </>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        📍 Location Tracking Test
                    </h1>
                    <p className="text-gray-300">
                        Phase 5: Location Tracking System Demo
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-gray-300 text-sm mb-1">Tracking Status</div>
                        <div className="text-2xl font-bold text-white">
                            {isTracking ? '🟢 Active' : '🔴 Stopped'}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-gray-300 text-sm mb-1">Total Updates</div>
                        <div className="text-2xl font-bold text-white">{stats.totalUpdates}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-gray-300 text-sm mb-1">Offline Queue</div>
                        <div className="text-2xl font-bold text-white">{offlineQueueSize}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-gray-300 text-sm mb-1">Battery Level</div>
                        <div className="text-2xl font-bold text-white">{batteryLevel.toFixed(0)}%</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-6">Controls</h2>

                        {/* Tracking Mode Selection */}
                        <div className="mb-6">
                            <label className="text-gray-300 text-sm mb-2 block">
                                Tracking Mode
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['high_accuracy', 'balanced', 'low_power', 'stealth'] as TrackingMode[]).map(
                                    (mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setTrackingMode(mode)}
                                            className={`px-4 py-3 rounded-lg font-medium transition-all ${trackingMode === mode
                                                    ? `${getModeColor(mode)} text-white`
                                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                }`}
                                        >
                                            {mode.replace('_', ' ').toUpperCase()}
                                            <div className="text-xs opacity-75">
                                                {getModeInterval(mode)}
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleGetCurrentLocation}
                                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
                            >
                                📍 Get Current Location
                            </button>

                            {!isTracking ? (
                                <button
                                    onClick={handleStartTracking}
                                    className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all"
                                >
                                    ▶️ Start Tracking
                                </button>
                            ) : (
                                <button
                                    onClick={handleStopTracking}
                                    className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                                >
                                    ⏹️ Stop Tracking
                                </button>
                            )}

                            <button
                                onClick={handleSyncOffline}
                                disabled={offlineQueueSize === 0}
                                className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🔄 Sync Offline Queue ({offlineQueueSize})
                            </button>
                        </div>

                        {/* Mode Info */}
                        <div className="mt-6 p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-300">
                                <div className="font-semibold mb-2">Current Mode: {trackingMode}</div>
                                <div className="text-xs space-y-1">
                                    <div>• Update Interval: {getModeInterval(trackingMode)}</div>
                                    <div>
                                        • High Accuracy:{' '}
                                        {trackingMode === 'low_power' ? 'No' : 'Yes'}
                                    </div>
                                    <div>
                                        • Use Case:{' '}
                                        {trackingMode === 'high_accuracy'
                                            ? 'SOS Mode'
                                            : trackingMode === 'balanced'
                                                ? 'Normal'
                                                : trackingMode === 'low_power'
                                                    ? 'Battery Saving'
                                                    : 'Silent SOS'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Location */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-6">Current Location</h2>

                        {currentLocation ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-gray-400 text-sm">Latitude</div>
                                        <div className="text-white font-mono">
                                            {currentLocation.latitude.toFixed(6)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Longitude</div>
                                        <div className="text-white font-mono">
                                            {currentLocation.longitude.toFixed(6)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Accuracy</div>
                                        <div className="text-white font-mono">
                                            {currentLocation.accuracy.toFixed(1)}m
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Timestamp</div>
                                        <div className="text-white font-mono text-xs">
                                            {new Date(currentLocation.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    {currentLocation.altitude && (
                                        <div>
                                            <div className="text-gray-400 text-sm">Altitude</div>
                                            <div className="text-white font-mono">
                                                {currentLocation.altitude.toFixed(1)}m
                                            </div>
                                        </div>
                                    )}
                                    {currentLocation.speed && (
                                        <div>
                                            <div className="text-gray-400 text-sm">Speed</div>
                                            <div className="text-white font-mono">
                                                {(currentLocation.speed * 3.6).toFixed(1)} km/h
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Google Maps Link */}
                                <a
                                    href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-lg font-medium transition-all"
                                >
                                    🗺️ View on Google Maps
                                </a>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-12">
                                No location data yet. Click "Get Current Location" to start.
                            </div>
                        )}
                    </div>
                </div>

                {/* Location History */}
                <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Location History (Last 10)
                    </h2>

                    {locationHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-300 border-b border-white/10">
                                        <th className="text-left py-2 px-3">Time</th>
                                        <th className="text-left py-2 px-3">Latitude</th>
                                        <th className="text-left py-2 px-3">Longitude</th>
                                        <th className="text-left py-2 px-3">Accuracy</th>
                                        <th className="text-left py-2 px-3">Speed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locationHistory.map((loc, idx) => (
                                        <tr
                                            key={idx}
                                            className="border-b border-white/5 hover:bg-white/5"
                                        >
                                            <td className="py-2 px-3 text-gray-300 font-mono text-xs">
                                                {new Date(loc.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="py-2 px-3 text-white font-mono">
                                                {loc.latitude.toFixed(6)}
                                            </td>
                                            <td className="py-2 px-3 text-white font-mono">
                                                {loc.longitude.toFixed(6)}
                                            </td>
                                            <td className="py-2 px-3 text-gray-300">
                                                {loc.accuracy.toFixed(1)}m
                                            </td>
                                            <td className="py-2 px-3 text-gray-300">
                                                {loc.speed
                                                    ? `${(loc.speed * 3.6).toFixed(1)} km/h`
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-8">
                            No location history yet
                        </div>
                    )}
                </div>

                {/* Testing Instructions */}
                <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-4">🧪 Testing Guide</h2>
                    <div className="space-y-3 text-gray-300 text-sm">
                        <div>
                            <strong className="text-white">1. Test Tracking Modes:</strong> Switch
                            between modes and observe update intervals
                        </div>
                        <div>
                            <strong className="text-white">2. Test Offline Queue:</strong> Enable
                            airplane mode, get locations, then disable and sync
                        </div>
                        <div>
                            <strong className="text-white">3. Test Battery Management:</strong>{' '}
                            Simulate low battery (if supported) to see auto-mode switching
                        </div>
                        <div>
                            <strong className="text-white">4. Test GPS Spoofing:</strong> Check
                            console for spoofing warnings if moving too fast
                        </div>
                        <div>
                            <strong className="text-white">5. Test Family Tracking:</strong> Use
                            /api/location/family endpoint to see family locations
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
