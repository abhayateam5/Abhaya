'use client';

import { useState } from 'react';
import { ZoneCreator, ZoneList, ZoneAlerts } from '@/components/Geofence';

export default function GeofenceTestPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleZoneChange = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-8 text-center">
                    🗺️ Geofencing Test
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Zone Creator */}
                        <ZoneCreator onZoneCreated={handleZoneChange} />

                        {/* Zone List */}
                        <div key={refreshKey}>
                            <ZoneList onZoneDeleted={handleZoneChange} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Zone Alerts */}
                        <ZoneAlerts />

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3">
                                📱 Testing Instructions
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-blue-700 text-sm">
                                <li><strong>Create Zone:</strong> Enter name, select type, click create</li>
                                <li><strong>Safe Zones:</strong> Green circles for safe areas</li>
                                <li><strong>Danger Zones:</strong> Red circles for risky areas</li>
                                <li><strong>Alerts:</strong> Real-time notifications when entering/exiting zones</li>
                                <li><strong>Location:</strong> Allow location permissions for alerts</li>
                            </ul>
                        </div>

                        {/* Features */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                ✨ Features
                            </h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Create personal safe/danger zones</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Real-time zone detection</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Entry/exit notifications</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Customizable radius (100m-5km)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Delete zones anytime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
