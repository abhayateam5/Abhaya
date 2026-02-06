'use client';

import { useState, useEffect } from 'react';

interface Evidence {
    id: string;
    type: 'photo' | 'audio' | 'screen' | 'location' | 'sensor';
    url?: string;
    timestamp: string;
    data?: any;
}

interface SOSEvidenceViewerProps {
    sosId: string;
    evidence?: Evidence[];
}

export default function SOSEvidenceViewer({ sosId, evidence = [] }: SOSEvidenceViewerProps) {
    const [selectedType, setSelectedType] = useState<string>('all');
    const [isCapturing, setIsCapturing] = useState(false);

    // Mock evidence for demo
    const mockEvidence: Evidence[] = [
        { id: '1', type: 'location', timestamp: new Date().toISOString(), data: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' } },
        { id: '2', type: 'photo', timestamp: new Date().toISOString(), url: '/placeholder-photo.jpg' },
        { id: '3', type: 'audio', timestamp: new Date().toISOString(), url: '/placeholder-audio.mp3' },
    ];

    const allEvidence = evidence.length > 0 ? evidence : mockEvidence;

    const filteredEvidence = selectedType === 'all'
        ? allEvidence
        : allEvidence.filter(e => e.type === selectedType);

    const getIcon = (type: string) => {
        const icons: Record<string, string> = {
            photo: '📷',
            audio: '🎤',
            screen: '📱',
            location: '📍',
            sensor: '📡',
        };
        return icons[type] || '📄';
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">📁 Evidence Captured</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isCapturing ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                    {isCapturing ? '🔴 Recording' : '⏸️ Paused'}
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
                {['all', 'photo', 'audio', 'location', 'sensor'].map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                            ${selectedType === type
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                    >
                        {type === 'all' ? '📋 All' : `${getIcon(type)} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </button>
                ))}
            </div>

            {/* Evidence grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvidence.map(item => (
                    <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getIcon(item.type)}</span>
                                <span className="font-medium text-gray-800 capitalize">{item.type}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
                        </div>

                        {/* Content based on type */}
                        {item.type === 'photo' && (
                            <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                                <span className="text-gray-500">📷 Photo captured</span>
                            </div>
                        )}

                        {item.type === 'audio' && (
                            <div className="bg-gray-100 rounded-lg p-3">
                                <div className="flex items-center space-x-2">
                                    <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                        ▶️
                                    </button>
                                    <div className="flex-1 h-2 bg-gray-300 rounded">
                                        <div className="w-1/3 h-full bg-blue-600 rounded"></div>
                                    </div>
                                    <span className="text-xs text-gray-600">0:30</span>
                                </div>
                            </div>
                        )}

                        {item.type === 'location' && item.data && (
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-sm text-gray-800">
                                    <div className="font-medium">{item.data.address || 'Unknown location'}</div>
                                    <div className="text-gray-600 text-xs mt-1">
                                        {item.data.lat?.toFixed(6)}, {item.data.lng?.toFixed(6)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {item.type === 'sensor' && (
                            <div className="bg-purple-50 rounded-lg p-3 text-sm">
                                <div className="text-gray-600">Accelerometer, WiFi, Bluetooth data</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredEvidence.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No evidence captured yet
                </div>
            )}

            {/* Stats */}
            <div className="mt-6 pt-4 border-t flex justify-between text-sm text-gray-600">
                <span>Total: {allEvidence.length} items</span>
                <span>Photos: {allEvidence.filter(e => e.type === 'photo').length}</span>
                <span>Audio: {allEvidence.filter(e => e.type === 'audio').length}</span>
                <span>Locations: {allEvidence.filter(e => e.type === 'location').length}</span>
            </div>
        </div>
    );
}
