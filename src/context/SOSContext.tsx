'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { SOS_COUNTDOWN_SECONDS } from '@/lib/constants';
import { useLocation } from './LocationContext';

interface SOSContextType {
    isActive: boolean;
    isCountingDown: boolean;
    countdown: number;
    alertId: string | null;
    triggerSOS: (type?: 'sos' | 'silent') => void;
    cancelSOS: () => void;
    confirmCancel: () => Promise<void>;
}

const SOSContext = createContext<SOSContextType | undefined>(undefined);

export function SOSProvider({ children }: { children: React.ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(SOS_COUNTDOWN_SECONDS);
    const [alertId, setAlertId] = useState<string | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const { position, getCurrentPosition } = useLocation();

    const sendSOSAlert = useCallback(async (type: 'sos' | 'silent' = 'sos') => {
        try {
            // Get current position
            let currentPos = position;
            if (!currentPos) {
                try {
                    currentPos = await getCurrentPosition();
                } catch {
                    // Use default location if GPS fails
                    currentPos = { latitude: 28.6139, longitude: 77.2090, timestamp: new Date() };
                }
            }

            const res = await fetch('/api/sos/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: currentPos.latitude,
                    longitude: currentPos.longitude,
                    type,
                    description: type === 'silent' ? 'Silent SOS triggered' : 'Emergency SOS triggered',
                }),
            });

            const data = await res.json();

            if (data.success && data.data) {
                setAlertId(data.data._id);
                setIsActive(true);
            }
        } catch (error) {
            console.error('SOS trigger failed:', error);
        }
    }, [position, getCurrentPosition]);

    const triggerSOS = useCallback((type: 'sos' | 'silent' = 'sos') => {
        if (type === 'silent') {
            // Silent SOS triggers immediately
            sendSOSAlert('silent');
            return;
        }

        // Start countdown for regular SOS
        setIsCountingDown(true);
        setCountdown(SOS_COUNTDOWN_SECONDS);

        let count = SOS_COUNTDOWN_SECONDS;
        countdownRef.current = setInterval(() => {
            count -= 1;
            setCountdown(count);

            if (count <= 0) {
                if (countdownRef.current) {
                    clearInterval(countdownRef.current);
                }
                setIsCountingDown(false);
                sendSOSAlert('sos');
            }
        }, 1000);
    }, [sendSOSAlert]);

    const cancelSOS = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        setIsCountingDown(false);
        setCountdown(SOS_COUNTDOWN_SECONDS);
    }, []);

    const confirmCancel = useCallback(async () => {
        if (!alertId) return;

        try {
            await fetch(`/api/sos/${alertId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'false_alarm',
                    resolutionNotes: 'Cancelled by user',
                }),
            });

            setIsActive(false);
            setAlertId(null);
        } catch (error) {
            console.error('SOS cancel failed:', error);
        }
    }, [alertId]);

    return (
        <SOSContext.Provider
            value={{
                isActive,
                isCountingDown,
                countdown,
                alertId,
                triggerSOS,
                cancelSOS,
                confirmCancel,
            }}
        >
            {children}
        </SOSContext.Provider>
    );
}

export function useSOS() {
    const context = useContext(SOSContext);
    if (!context) {
        throw new Error('useSOS must be used within an SOSProvider');
    }
    return context;
}
