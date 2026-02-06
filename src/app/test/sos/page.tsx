'use client';

import { useState, useEffect } from 'react';
import SOSButton from '@/components/SOS/SOSButton';
import SOSEscalationTimeline from '@/components/SOS/SOSEscalationTimeline';
import SOSEvidenceViewer from '@/components/SOS/SOSEvidenceViewer';

export default function SOSTestPage() {
    const [sosId, setSOSId] = useState<string | null>(null);
    const [enableShake, setEnableShake] = useState(false);
    const [enableVolume, setEnableVolume] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showEvidence, setShowEvidence] = useState(false);
    const [sosStartTime, setSosStartTime] = useState<Date | null>(null);

    const handleSOSTriggered = (id: string) => {
        setSOSId(id);
        setSosStartTime(new Date());
        setShowTimeline(true);
        console.log('SOS triggered with ID:', id);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-8 text-center">
                    🚨 SOS System Test
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Configuration */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Trigger Settings</h2>

                            <div className="space-y-4">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={enableShake}
                                        onChange={(e) => setEnableShake(e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <span className="text-gray-800">Enable Shake Detection (HTTPS required)</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={enableVolume}
                                        onChange={(e) => setEnableVolume(e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <span className="text-gray-800">Enable Volume Button (Native apps only)</span>
                                </label>
                            </div>
                        </div>

                        {/* SOS Button */}
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="flex flex-col items-center">
                                <h2 className="text-xl font-semibold mb-6 text-gray-800">Emergency SOS</h2>
                                <SOSButton
                                    enableShake={enableShake}
                                    enableVolume={enableVolume}
                                    onSOSTriggered={handleSOSTriggered}
                                />
                                <p className="mt-4 text-gray-600 text-center text-sm max-w-md">
                                    Hold the SOS button for 3 seconds to trigger an emergency alert.
                                </p>
                            </div>
                        </div>

                        {/* Status */}
                        {sosId && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-green-800 mb-2">
                                    ✅ SOS Alert Sent!
                                </h3>
                                <p className="text-green-700 text-sm">
                                    SOS ID: <code className="bg-green-100 px-2 py-1 rounded text-xs">{sosId}</code>
                                </p>
                            </div>
                        )}

                        {/* View toggles */}
                        {sosId && (
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setShowTimeline(!showTimeline)}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${showTimeline
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    📊 Timeline
                                </button>
                                <button
                                    onClick={() => setShowEvidence(!showEvidence)}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${showEvidence
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    📁 Evidence
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {showTimeline && sosId && (
                            <SOSEscalationTimeline
                                sosId={sosId}
                                currentLevel={0}
                                startTime={sosStartTime || new Date()}
                            />
                        )}

                        {showEvidence && sosId && (
                            <SOSEvidenceViewer sosId={sosId} />
                        )}

                        {!sosId && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                                    📱 Testing Instructions
                                </h3>
                                <ul className="list-disc list-inside space-y-2 text-blue-700 text-sm">
                                    <li><strong>Button:</strong> Hold the red button for 3 seconds</li>
                                    <li><strong>Shake:</strong> Requires HTTPS (deploy to Vercel)</li>
                                    <li><strong>Volume:</strong> Requires native mobile app</li>
                                    <li><strong>Location:</strong> Allow location permissions</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
