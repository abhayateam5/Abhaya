'use client';

import { useState, useEffect } from 'react';
import { triggerSOS } from '@/lib/sos';
import { getCurrentLocation } from '@/lib/location';
import { ShakeDetector } from '@/lib/triggers/shake-detector';
import { VolumeDetector } from '@/lib/triggers/volume-detector';

interface SOSButtonProps {
    enableShake?: boolean;
    enableVolume?: boolean;
    onSOSTriggered?: (sosId: string) => void;
}

export default function SOSButton({
    enableShake = false,
    enableVolume = false,
    onSOSTriggered,
}: SOSButtonProps) {
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isTriggering, setIsTriggering] = useState(false);
    const [shakeDetector, setShakeDetector] = useState<ShakeDetector | null>(null);
    const [volumeDetector, setVolumeDetector] = useState<VolumeDetector | null>(null);

    const HOLD_DURATION = 3000; // 3 seconds

    // Initialize detectors
    useEffect(() => {
        if (enableShake && !shakeDetector) {
            const detector = new ShakeDetector({
                onShakeDetected: () => handleAutoTrigger('shake'),
            });
            detector.start();
            setShakeDetector(detector);
        }

        if (enableVolume && !volumeDetector) {
            const detector = new VolumeDetector({
                onVolumePatternDetected: () => handleAutoTrigger('volume'),
            });
            detector.start();
            setVolumeDetector(detector);
        }

        return () => {
            shakeDetector?.stop();
            volumeDetector?.stop();
        };
    }, [enableShake, enableVolume]);

    // Handle hold progress
    useEffect(() => {
        if (!isHolding) {
            setHoldProgress(0);
            return;
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setHoldProgress(progress);

            if (progress >= 100) {
                handleTrigger('button');
                setIsHolding(false);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isHolding]);

    const handleAutoTrigger = async (mode: 'shake' | 'volume') => {
        if (isTriggering) return;

        console.log(`SOS auto-triggered via ${mode}`);
        await triggerSOSEvent(mode);
    };

    const handleTrigger = async (mode: 'button') => {
        if (isTriggering) return;

        console.log('SOS triggered via button');
        await triggerSOSEvent(mode);
    };

    const triggerSOSEvent = async (mode: 'button' | 'shake' | 'volume') => {
        setIsTriggering(true);

        try {
            // Get current location
            const { data: location, error: locError } = await getCurrentLocation('high_accuracy');

            if (locError || !location) {
                alert('Could not get location. Please enable location services.');
                return;
            }

            // Trigger SOS via API
            const response = await fetch('/api/sos/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    description: `SOS triggered via ${mode}`,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('SOS created:', data);
                onSOSTriggered?.(data.sosId);
                alert('🚨 SOS Alert Sent! Family and emergency services have been notified.');
            } else {
                console.error('SOS trigger failed:', data.error);
                alert(`Failed to send SOS: ${data.error}`);
            }
        } catch (error) {
            console.error('Error triggering SOS:', error);
            alert('Failed to send SOS. Please try again.');
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Main SOS Button */}
            <button
                onMouseDown={() => !isTriggering && setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => !isTriggering && setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                disabled={isTriggering}
                className="relative w-40 h-40 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-2xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    background: isHolding
                        ? `conic-gradient(#ef4444 ${holdProgress}%, #dc2626 ${holdProgress}%)`
                        : undefined,
                }}
            >
                {isTriggering ? (
                    <span className="text-lg">Sending...</span>
                ) : isHolding ? (
                    <span className="text-lg">Hold...</span>
                ) : (
                    <>
                        <div className="text-4xl">🚨</div>
                        <div className="text-sm mt-1">SOS</div>
                        <div className="text-xs opacity-75">Hold 3s</div>
                    </>
                )}
            </button>

            {/* Status Indicators */}
            <div className="flex flex-col items-center space-y-2 text-sm text-gray-600">
                {enableShake && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Shake detection active</span>
                    </div>
                )}
                {enableVolume && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Volume button detection active</span>
                    </div>
                )}
            </div>
        </div>
    );
}
