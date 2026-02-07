'use client';

import { useState } from 'react';
import { SafetyScoreDisplay } from '@/components/SafetyScore';

export default function SafetyScoreTestPage() {
    const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi
    const [batteryLevel, setBatteryLevel] = useState(75);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Safety Score v2 Test
                    </h1>
                    <p className="text-gray-600">
                        Test the enhanced safety scoring system with weighted factors
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Parameters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={location.lat}
                                onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={location.lng}
                                onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>

                        {/* Battery Level */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Battery Level: {batteryLevel}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={batteryLevel}
                                onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Preset Locations */}
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preset Locations:</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setLocation({ lat: 28.6139, lng: 77.2090 })}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                            >
                                Delhi
                            </button>
                            <button
                                onClick={() => setLocation({ lat: 19.0760, lng: 72.8777 })}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                            >
                                Mumbai
                            </button>
                            <button
                                onClick={() => setLocation({ lat: 12.9716, lng: 77.5946 })}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                            >
                                Bangalore
                            </button>
                        </div>
                    </div>
                </div>

                {/* Safety Score Display */}
                <SafetyScoreDisplay location={location} batteryLevel={batteryLevel} />

                {/* Algorithm Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Scoring Algorithm
                    </h3>
                    <p className="text-blue-800 mb-3">
                        Composite Score = Weighted Average of 5 Factors:
                    </p>
                    <ul className="text-blue-800 space-y-1 text-sm">
                        <li>• Location Safety (40%) - Based on area crime rate, lighting, police presence</li>
                        <li>• Recent Incidents (20%) - Nearby incidents in last 7 days</li>
                        <li>• Time of Day (15%) - Lower scores for late night/early morning</li>
                        <li>• User Behavior (15%) - Check-in frequency, SOS usage, geofence compliance</li>
                        <li>• Battery Level (10%) - Lower scores for low battery</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
