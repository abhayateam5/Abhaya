'use client';

import { useState } from 'react';

interface ZoneCreatorProps {
    onZoneCreated?: () => void;
}

export default function ZoneCreator({ onZoneCreated }: ZoneCreatorProps) {
    const [name, setName] = useState('');
    const [zoneType, setZoneType] = useState<'safe' | 'risk'>('safe');
    const [radius, setRadius] = useState('500');
    const [isCreating, setIsCreating] = useState(false);

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                createZone(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                alert('Error getting location: ' + error.message);
            }
        );
    };

    const createZone = async (lat: number, lng: number) => {
        if (!name.trim()) {
            alert('Please enter a zone name');
            return;
        }

        setIsCreating(true);

        try {
            const response = await fetch('/api/zones/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    zone_type: zoneType,
                    center_lat: lat,
                    center_lng: lng,
                    radius: parseInt(radius),
                    type: 'public_place',
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ ${zoneType === 'safe' ? 'Safe' : 'Danger'} zone created!`);
                setName('');
                onZoneCreated?.();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating zone:', error);
            alert('Failed to create zone');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create Zone</h3>

            <div className="space-y-4">
                {/* Zone Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., My Hotel, Danger Area"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                </div>

                {/* Zone Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone Type
                    </label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="safe"
                                checked={zoneType === 'safe'}
                                onChange={() => setZoneType('safe')}
                                className="mr-2"
                            />
                            <span className="text-green-600 font-medium">🟢 Safe Zone</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="risk"
                                checked={zoneType === 'risk'}
                                onChange={() => setZoneType('risk')}
                                className="mr-2"
                            />
                            <span className="text-red-600 font-medium">🔴 Danger Zone</span>
                        </label>
                    </div>
                </div>

                {/* Radius */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Radius (meters)
                    </label>
                    <input
                        type="number"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        min="100"
                        max="5000"
                        step="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {radius}m = {(parseInt(radius) / 1000).toFixed(2)}km
                    </p>
                </div>

                {/* Create Button */}
                <button
                    onClick={handleGetCurrentLocation}
                    disabled={isCreating || !name.trim()}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${isCreating || !name.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : zoneType === 'safe'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                >
                    {isCreating ? 'Creating...' : `Create ${zoneType === 'safe' ? 'Safe' : 'Danger'} Zone`}
                </button>

                <p className="text-xs text-gray-500 text-center">
                    Zone will be created at your current location
                </p>
            </div>
        </div>
    );
}
