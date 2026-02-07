'use client';

import { AnomalyAlerts } from '@/components/Itinerary';

export default function ItineraryTestPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-purple-600 mb-8 text-center">
                    🗺️ Itinerary & Anomaly Detection Test
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Anomaly Alerts */}
                        <AnomalyAlerts />

                        {/* Instructions */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-purple-800 mb-3">
                                📱 Testing Instructions
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-purple-700 text-sm">
                                <li><strong>Detect:</strong> Click "Detect Now" to run anomaly checks</li>
                                <li><strong>Location:</strong> Allow location permissions</li>
                                <li><strong>Critical:</strong> Critical anomalies auto-trigger SOS</li>
                                <li><strong>Types:</strong> Inactivity, deviation, speed, GPS loss, unusual hours, battery</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Features */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                ✨ Anomaly Detection Features
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="font-semibold text-red-800">🚨 Critical</p>
                                    <p className="text-sm text-red-700">Auto-triggers SOS</p>
                                </div>
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p className="font-semibold text-orange-800">⚠️ High</p>
                                    <p className="text-sm text-orange-700">Alerts family</p>
                                </div>
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="font-semibold text-yellow-800">⚡ Medium</p>
                                    <p className="text-sm text-yellow-700">Notification only</p>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="font-semibold text-blue-800">ℹ️ Low</p>
                                    <p className="text-sm text-blue-700">Logged for review</p>
                                </div>
                            </div>
                        </div>

                        {/* Anomaly Types */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                🔍 Detection Types
                            </h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span><strong>Inactivity:</strong> No activity for 30+ min</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span><strong>Route Deviation:</strong> >2km off course</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span><strong>Speed Anomaly:</strong> Unusual speed patterns</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span><strong>GPS Loss:</strong> Signal lost >5 min</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span><strong>Unusual Hours:</strong> Activity 2-5 AM</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span><strong>Battery Drain:</strong> Low battery warning</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
