'use client';

import { useState, useEffect } from 'react';
import { getScoreColor, getScoreBgColor, getScoreLabel, type SafetyScoreBreakdown } from '@/lib/safetyScore';

interface SafetyScoreDisplayProps {
    location?: { lat: number; lng: number };
    batteryLevel?: number;
}

export default function SafetyScoreDisplay({ location, batteryLevel = 100 }: SafetyScoreDisplayProps) {
    const [score, setScore] = useState<SafetyScoreBreakdown | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateScore = async () => {
        if (!location) {
            setError('Location is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/safety-score/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, batteryLevel }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to calculate score');
            }

            setScore(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location) {
            calculateScore();
        }
    }, [location, batteryLevel]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800">Error: {error}</p>
                <button
                    onClick={calculateScore}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!score) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">No score data available</p>
            </div>
        );
    }

    const factors = [
        { label: 'Location Safety', value: score.location, weight: '40%' },
        { label: 'Recent Incidents', value: score.recentIncidents, weight: '20%' },
        { label: 'Time of Day', value: score.timeOfDay, weight: '15%' },
        { label: 'User Behavior', value: score.userBehavior, weight: '15%' },
        { label: 'Battery Level', value: score.battery, weight: '10%' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Composite Score */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety Score</h2>
                <div className={`text-6xl font-bold ${getScoreColor(score.composite)} mb-2`}>
                    {score.composite}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full ${getScoreBgColor(score.composite)}`}>
                    <span className={`font-semibold ${getScoreColor(score.composite)}`}>
                        {getScoreLabel(score.composite)}
                    </span>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                {factors.map((factor) => (
                    <div key={factor.label}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                                {factor.label} ({factor.weight})
                            </span>
                            <span className={`text-sm font-semibold ${getScoreColor(factor.value)}`}>
                                {factor.value}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${factor.value >= 80 ? 'bg-green-500' :
                                        factor.value >= 60 ? 'bg-yellow-500' :
                                            factor.value >= 40 ? 'bg-orange-500' :
                                                'bg-red-500'
                                    }`}
                                style={{ width: `${factor.value}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Refresh Button */}
            <button
                onClick={calculateScore}
                className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Refresh Score
            </button>
        </div>
    );
}
