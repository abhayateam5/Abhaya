'use client';

import { useEffect, useState } from 'react';

interface Escalation {
    level: number;
    target: string;
    status: 'pending' | 'sent' | 'acknowledged' | 'failed';
    time: string;
    icon: string;
}

interface SOSEscalationTimelineProps {
    sosId?: string;
    currentLevel?: number;
    startTime?: Date;
    onMarkSafe?: () => void;
    onEscalate?: () => void;
}

export default function SOSEscalationTimeline({
    sosId,
    currentLevel = 0,
    startTime = new Date(),
    onMarkSafe,
    onEscalate,
}: SOSEscalationTimelineProps) {
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [level, setLevel] = useState(currentLevel);
    const [isResolved, setIsResolved] = useState(false);

    // Reset state when sosId changes (new SOS triggered)
    useEffect(() => {
        setLevel(0);
        setIsResolved(false);
        setElapsedMinutes(0);
    }, [sosId]);

    const escalationLevels: Escalation[] = [
        { level: 0, target: 'Family Members', status: 'sent', time: '0 min', icon: '👨‍👩‍👧' },
        { level: 1, target: 'Nearby Police', status: 'pending', time: '2 min', icon: '👮' },
        { level: 2, target: 'Emergency Services (112)', status: 'pending', time: '5 min', icon: '🚑' },
        { level: 3, target: 'Embassy', status: 'pending', time: '10 min', icon: '🏛️' },
    ];

    // Update elapsed time
    useEffect(() => {
        if (isResolved) return;
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime.getTime()) / 60000;
            setElapsedMinutes(Math.floor(elapsed));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, isResolved]);

    // Determine status based on elapsed time and current level
    const getStatus = (lvl: number): 'pending' | 'sent' | 'acknowledged' | 'active' => {
        if (lvl < level) return 'acknowledged';
        if (lvl === level) return 'active';
        return 'pending';
    };

    const handleMarkSafe = async () => {
        if (!sosId) return;
        try {
            const response = await fetch(`/api/sos/${sosId}/resolve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolution_notes: 'User marked safe', is_false_alarm: false }),
            });
            if (response.ok) {
                setIsResolved(true);
                onMarkSafe?.();
                alert('✅ Marked safe! SOS resolved.');
            }
        } catch (error) {
            console.error('Error marking safe:', error);
        }
    };

    const handleEscalate = async () => {
        if (level >= 3) {
            alert('Already at maximum escalation level!');
            return;
        }
        setLevel(prev => Math.min(prev + 1, 3));
        onEscalate?.();
        alert(`⚡ Escalated to Level ${level + 1}!`);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">🚨 Escalation Timeline</h3>
                <div className="text-sm text-gray-600">
                    Elapsed: <span className="font-bold text-red-600">{elapsedMinutes} min</span>
                </div>
            </div>

            {isResolved && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-center font-semibold">
                    ✅ SOS Resolved - User is safe
                </div>
            )}

            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {escalationLevels.map((escalation, index) => {
                    const status = getStatus(escalation.level);
                    const isActive = status === 'active';
                    const isDone = status === 'acknowledged';

                    return (
                        <div key={escalation.level} className="relative pl-16 pb-6 last:pb-0">
                            {/* Circle indicator */}
                            <div
                                className={`absolute left-4 w-5 h-5 rounded-full border-2 
                                    ${isDone ? 'bg-green-500 border-green-500' : ''}
                                    ${isActive ? 'bg-red-500 border-red-500 animate-pulse' : ''}
                                    ${status === 'pending' ? 'bg-white border-gray-300' : ''}
                                `}
                            >
                                {isDone && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</span>
                                )}
                            </div>

                            {/* Content */}
                            <div
                                className={`p-4 rounded-lg border-2 transition-all
                                    ${isDone ? 'border-green-200 bg-green-50' : ''}
                                    ${isActive ? 'border-red-300 bg-red-50 shadow-md' : ''}
                                    ${status === 'pending' ? 'border-gray-200 bg-gray-50 opacity-60' : ''}
                                `}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{escalation.icon}</span>
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {escalation.target}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Triggers at {escalation.time}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`px-3 py-1 rounded-full text-xs font-semibold
                                            ${isDone ? 'bg-green-200 text-green-800' : ''}
                                            ${isActive ? 'bg-red-200 text-red-800' : ''}
                                            ${status === 'pending' ? 'bg-gray-200 text-gray-600' : ''}
                                        `}
                                    >
                                        {isDone ? 'Notified' : isActive ? 'Active' : 'Pending'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action buttons */}
            {!isResolved && (
                <div className="mt-6 flex space-x-4">
                    <button
                        onClick={handleMarkSafe}
                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        ✓ Mark Safe
                    </button>
                    <button
                        onClick={handleEscalate}
                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        ⚡ Escalate Now
                    </button>
                </div>
            )}
        </div>
    );
}
