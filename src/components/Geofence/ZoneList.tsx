'use client';

import { useState, useEffect } from 'react';

interface Zone {
    id: string;
    name: string;
    radius?: number;
    type?: string;
    risk_level?: number;
    safety_rating?: number;
}

interface ZoneListProps {
    onZoneDeleted?: () => void;
}

export default function ZoneList({ onZoneDeleted }: ZoneListProps) {
    const [safeZones, setSafeZones] = useState<Zone[]>([]);
    const [riskZones, setRiskZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/zones/user');
            const data = await response.json();

            if (data.success) {
                setSafeZones(data.safeZones || []);
                setRiskZones(data.riskZones || []);
            }
        } catch (error) {
            console.error('Error fetching zones:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (zoneId: string, zoneName: string) => {
        if (!confirm(`Delete zone "${zoneName}"?`)) return;

        try {
            const response = await fetch(`/api/zones/${zoneId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Zone deleted');
                fetchZones();
                onZoneDeleted?.();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting zone:', error);
            alert('Failed to delete zone');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-500 text-center">Loading zones...</p>
            </div>
        );
    }

    const totalZones = safeZones.length + riskZones.length;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">My Zones</h3>
                <span className="text-sm text-gray-600">
                    {totalZones} zone{totalZones !== 1 ? 's' : ''}
                </span>
            </div>

            {totalZones === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    No zones created yet. Create one above!
                </p>
            ) : (
                <div className="space-y-4">
                    {/* Safe Zones */}
                    {safeZones.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-green-700 mb-2">
                                🟢 Safe Zones ({safeZones.length})
                            </h4>
                            <div className="space-y-2">
                                {safeZones.map((zone) => (
                                    <div
                                        key={zone.id}
                                        className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">{zone.name}</p>
                                            <p className="text-xs text-gray-600">
                                                Radius: {zone.radius}m
                                                {zone.safety_rating && ` • Rating: ${zone.safety_rating}/5`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(zone.id, zone.name)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risk Zones */}
                    {riskZones.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-red-700 mb-2">
                                🔴 Danger Zones ({riskZones.length})
                            </h4>
                            <div className="space-y-2">
                                {riskZones.map((zone) => (
                                    <div
                                        key={zone.id}
                                        className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">{zone.name}</p>
                                            <p className="text-xs text-gray-600">
                                                Risk Level: {zone.risk_level}/10
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(zone.id, zone.name)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
