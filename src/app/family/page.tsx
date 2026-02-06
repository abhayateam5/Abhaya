'use client';

import { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import FamilyMap from '@/components/FamilyMap';
import FamilyManager from '@/components/FamilyManager';
import type { FamilyMember } from '@/lib/family';

export default function FamilyPage() {
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showManager, setShowManager] = useState(false);

    // Fetch family members
    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/family');
            const data = await response.json();

            if (data.data) {
                setMembers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch family members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchMembers, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Users className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Family Safety Network</h1>
                        </div>

                        <button
                            onClick={() => setShowManager(!showManager)}
                            className={`px-4 py-2 rounded-lg flex items-center ${showManager
                                    ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {showManager ? 'View Map' : 'Manage Family'}
                        </button>
                    </div>

                    <p className="text-gray-600 mt-2">
                        Track your family members' locations and stay connected for safety.
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading family members...</p>
                    </div>
                ) : showManager ? (
                    <FamilyManager
                        onInviteGenerated={() => fetchMembers()}
                        onCheckIn={() => fetchMembers()}
                        onPanicWordSet={() => { }}
                    />
                ) : (
                    <FamilyMap
                        members={members}
                        onMemberClick={(member) => console.log('Selected:', member)}
                    />
                )}
            </div>
        </div>
    );
}
