'use client';

import { useState } from 'react';
import { EFIRForm, EFIRList } from '@/components/EFIR';

export default function EFIRTestPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEFIRCreated = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-8 text-center">
                    📝 e-FIR System Test
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* e-FIR Form */}
                        <EFIRForm onSuccess={handleEFIRCreated} />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* e-FIR List */}
                        <div key={refreshKey}>
                            <EFIRList />
                        </div>

                        {/* Instructions */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-indigo-800 mb-3">
                                📱 Testing Instructions
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-indigo-700 text-sm">
                                <li><strong>Auto-Fill:</strong> Profile details pre-populated</li>
                                <li><strong>Location:</strong> GPS coordinates captured automatically</li>
                                <li><strong>FIR Number:</strong> Format FIR/YYYY/MM/XXXXX</li>
                                <li><strong>Hash:</strong> Tamper-proof SHA-256 generated</li>
                                <li><strong>Status:</strong> Tracks draft → submitted → registered</li>
                            </ul>
                        </div>

                        {/* Features */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                ✨ e-FIR Features
                            </h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Auto-fill from user profile</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>GPS location capture</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Unique FIR number generation</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Tamper-proof hash (SHA-256)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Status tracking</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Evidence upload support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
