'use client';

import { useState, useEffect } from 'react';
import { getStatusColor } from '@/lib/efir';

interface EFIR {
    id: string;
    fir_number: string;
    incident_type: string;
    incident_date: string;
    status: string;
    created_at: string;
}

export default function EFIRList() {
    const [efirs, setEfirs] = useState<EFIR[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEFIRs();
    }, []);

    const fetchEFIRs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/efir/user');
            const data = await response.json();

            if (data.success) {
                setEfirs(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching e-FIRs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-500 text-center">Loading e-FIRs...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">My e-FIRs</h3>
                <span className="text-sm text-gray-600">
                    {efirs.length} FIR{efirs.length !== 1 ? 's' : ''}
                </span>
            </div>

            {efirs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    No e-FIRs created yet. Create one above!
                </p>
            ) : (
                <div className="space-y-3">
                    {efirs.map((efir) => (
                        <div
                            key={efir.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-blue-600">{efir.fir_number}</p>
                                    <p className="text-sm text-gray-600 capitalize">
                                        {efir.incident_type?.replace('_', ' ')}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(efir.status)}`}>
                                    {efir.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Created: {new Date(efir.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
