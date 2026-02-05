'use client';

import { useEffect, useState } from 'react';
import { updateTrackingMode, type TrackingMode } from '@/lib/location';
import { useAuth } from '@/components/providers/AuthProvider';

interface BatteryManagerProps {
    onModeChange?: (mode: TrackingMode) => void;
    onLowBattery?: (level: number) => void;
}

export default function BatteryManager({ onModeChange, onLowBattery }: BatteryManagerProps) {
    const { user } = useAuth();
    const [batteryLevel, setBatteryLevel] = useState<number>(100);
    const [isCharging, setIsCharging] = useState<boolean>(false);
    const [currentMode, setCurrentMode] = useState<TrackingMode>('balanced');

    useEffect(() => {
        if (!user) return;

        // Check if Battery API is available
        if (!('getBattery' in navigator)) {
            console.warn('Battery API not supported');
            return;
        }

        let battery: any;

        const initBattery = async () => {
            try {
                battery = await (navigator as any).getBattery();

                // Initial state
                setBatteryLevel(battery.level * 100);
                setIsCharging(battery.charging);

                // Battery level change
                battery.addEventListener('levelchange', () => {
                    const level = battery.level * 100;
                    setBatteryLevel(level);
                    handleBatteryChange(level, battery.charging);
                });

                // Charging state change
                battery.addEventListener('chargingchange', () => {
                    setIsCharging(battery.charging);
                    handleBatteryChange(battery.level * 100, battery.charging);
                });
            } catch (error) {
                console.error('Failed to initialize battery monitoring:', error);
            }
        };

        initBattery();

        return () => {
            if (battery) {
                battery.removeEventListener('levelchange', () => { });
                battery.removeEventListener('chargingchange', () => { });
            }
        };
    }, [user]);

    const handleBatteryChange = async (level: number, charging: boolean) => {
        // Don't change mode if charging
        if (charging) {
            if (currentMode !== 'balanced') {
                setCurrentMode('balanced');
                if (onModeChange) onModeChange('balanced');
            }
            return;
        }

        // Auto-switch modes based on battery level
        if (level < 5) {
            // Critical battery - send last location and stop tracking
            console.warn('Critical battery level (<5%), sending last location');
            if (onLowBattery) onLowBattery(level);

            // Send notification to family
            await notifyFamilyLowBattery(level);
        } else if (level < 10) {
            // Very low battery - warn family
            console.warn('Very low battery (<10%), notifying family');
            if (onLowBattery) onLowBattery(level);

            await notifyFamilyLowBattery(level);

            if (currentMode !== 'low_power') {
                setCurrentMode('low_power');
                if (onModeChange) onModeChange('low_power');
            }
        } else if (level < 20) {
            // Low battery - switch to low power mode
            console.log('Low battery (<20%), switching to low_power mode');

            if (currentMode !== 'low_power') {
                setCurrentMode('low_power');
                if (onModeChange) onModeChange('low_power');
            }
        } else {
            // Normal battery - use balanced mode
            if (currentMode !== 'balanced') {
                setCurrentMode('balanced');
                if (onModeChange) onModeChange('balanced');
            }
        }
    };

    const notifyFamilyLowBattery = async (level: number) => {
        try {
            // Create event for low battery
            await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_type: 'ANOMALY_DETECTED',
                    severity: level < 5 ? 'critical' : 'warning',
                    metadata: {
                        type: 'low_battery',
                        battery_level: level,
                    },
                }),
            });
        } catch (error) {
            console.error('Failed to notify family of low battery:', error);
        }
    };

    // This component doesn't render anything
    return null;
}
