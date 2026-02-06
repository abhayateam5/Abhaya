'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, Battery, AlertCircle } from 'lucide-react';
import type { FamilyMember } from '@/lib/family';

interface FamilyMapProps {
    members?: FamilyMember[];
    onMemberClick?: (member: FamilyMember) => void;
}

export default function FamilyMap({ members = [], onMemberClick }: FamilyMapProps) {
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

    const handleMemberClick = (member: FamilyMember) => {
        setSelectedMember(member);
        if (onMemberClick) onMemberClick(member);
    };

    const getStatusColor = (member: FamilyMember) => {
        if (member.status !== 'active') return 'text-gray-400';

        // Check last seen
        if (!member.last_seen) return 'text-gray-400';

        const lastSeen = new Date(member.last_seen);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / 60000;

        if (diffMinutes < 5) return 'text-green-500'; // Online
        if (diffMinutes < 30) return 'text-yellow-500'; // Recently active
        return 'text-red-500'; // Offline
    };

    const getLastSeenText = (member: FamilyMember) => {
        if (!member.last_seen) return 'Never';

        const lastSeen = new Date(member.last_seen);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const calculateDistance = (
        lat1?: number,
        lon1?: number,
        lat2?: number,
        lon2?: number
    ): number | null => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;

        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Family Locations</h2>

                {members.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>No family members added yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                onClick={() => handleMemberClick(member)}
                                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {/* Profile photo */}
                                        <div className="relative">
                                            {member.photo ? (
                                                <img
                                                    src={member.photo}
                                                    alt={member.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-lg font-semibold text-gray-600">
                                                        {member.name[0].toUpperCase()}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Status indicator */}
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member) === 'text-green-500' ? 'bg-green-500' :
                                                    getStatusColor(member) === 'text-yellow-500' ? 'bg-yellow-500' :
                                                        'bg-gray-400'
                                                }`} />
                                        </div>

                                        {/* Member info */}
                                        <div>
                                            <h3 className="font-semibold text-lg">{member.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{member.relationship}</p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center space-x-4 text-sm">
                                        {/* Last seen */}
                                        <div className="flex items-center space-x-1 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{getLastSeenText(member)}</span>
                                        </div>

                                        {/* Battery */}
                                        {member.battery_level !== undefined && (
                                            <div className={`flex items-center space-x-1 ${member.battery_level < 20 ? 'text-red-500' :
                                                    member.battery_level < 50 ? 'text-yellow-500' :
                                                        'text-green-500'
                                                }`}>
                                                <Battery className="w-4 h-4" />
                                                <span>{member.battery_level}%</span>
                                            </div>
                                        )}

                                        {/* Location */}
                                        {member.location && (
                                            <div className="flex items-center space-x-1 text-blue-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>Located</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location details */}
                                {member.location && (
                                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                                        <div className="flex items-center justify-between">
                                            <span>
                                                {member.location.latitude.toFixed(6)}, {member.location.longitude.toFixed(6)}
                                            </span>
                                            {member.location.accuracy && (
                                                <span className="text-xs text-gray-500">
                                                    Accuracy: ±{Math.round(member.location.accuracy)}m
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected member details */}
            {selectedMember && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Selected: {selectedMember.name}</h3>
                    <div className="space-y-1 text-sm text-blue-800">
                        <p>Email: {selectedMember.email}</p>
                        {selectedMember.phone && <p>Phone: {selectedMember.phone}</p>}
                        <p>Status: <span className="capitalize">{selectedMember.status}</span></p>
                        <p>Can view location: {selectedMember.can_view_location ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
