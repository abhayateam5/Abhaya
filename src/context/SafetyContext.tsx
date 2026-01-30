'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SafetyFactors } from '@/types';

interface SafetyContextType {
    score: number;
    level: 'excellent' | 'good' | 'moderate' | 'low' | 'critical';
    factors: SafetyFactors | null;
    isLoading: boolean;
    error: string | null;
    refreshScore: () => Promise<void>;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export function SafetyProvider({ children }: { children: React.ReactNode }) {
    const [score, setScore] = useState(75);
    const [level, setLevel] = useState<SafetyContextType['level']>('good');
    const [factors, setFactors] = useState<SafetyFactors | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshScore = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/safety-score');
            const data = await res.json();

            if (data.success && data.data) {
                setScore(data.data.score);
                setLevel(data.data.level);
                setFactors(data.data.factors);
            } else {
                setError(data.error || 'Failed to fetch safety score');
            }
        } catch (err) {
            setError('Network error');
            console.error('Safety score fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <SafetyContext.Provider
            value={{
                score,
                level,
                factors,
                isLoading,
                error,
                refreshScore,
            }}
        >
            {children}
        </SafetyContext.Provider>
    );
}

export function useSafety() {
    const context = useContext(SafetyContext);
    if (!context) {
        throw new Error('useSafety must be used within a SafetyProvider');
    }
    return context;
}
