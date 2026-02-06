/**
 * Shake Detector
 * Detects 3 rapid shakes within 2 seconds to trigger SOS
 */

export interface ShakeDetectorOptions {
    threshold?: number; // Acceleration threshold in m/s² (default: 15)
    shakeCount?: number; // Number of shakes required (default: 3)
    timeWindow?: number; // Time window in ms (default: 2000)
    onShakeDetected?: () => void;
}

export class ShakeDetector {
    private threshold: number;
    private shakeCount: number;
    private timeWindow: number;
    private onShakeDetected?: () => void;

    private shakes: number[] = []; // Timestamps of detected shakes
    private lastAcceleration = { x: 0, y: 0, z: 0 };
    private isListening = false;

    constructor(options: ShakeDetectorOptions = {}) {
        this.threshold = options.threshold || 10; // Lowered for better sensitivity
        this.shakeCount = options.shakeCount || 3;
        this.timeWindow = options.timeWindow || 2000;
        this.onShakeDetected = options.onShakeDetected;
    }

    /**
     * Start listening for shakes
     */
    start(): boolean {
        if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
            console.warn('DeviceMotionEvent not supported');
            return false;
        }

        // Request permission on iOS 13+
        if (
            typeof (DeviceMotionEvent as any).requestPermission === 'function'
        ) {
            (DeviceMotionEvent as any)
                .requestPermission()
                .then((response: string) => {
                    if (response === 'granted') {
                        this.attachListener();
                    } else {
                        console.warn('Motion permission denied');
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS or older iOS
            this.attachListener();
        }

        return true;
    }

    /**
     * Stop listening for shakes
     */
    stop(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('devicemotion', this.handleMotion);
        }
        this.isListening = false;
        this.shakes = [];
    }

    /**
     * Attach motion event listener
     */
    private attachListener(): void {
        window.addEventListener('devicemotion', this.handleMotion);
        this.isListening = true;
    }

    /**
     * Handle device motion events
     */
    private handleMotion = (event: DeviceMotionEvent): void => {
        if (!event.accelerationIncludingGravity) return;

        const { x, y, z } = event.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;

        // Calculate change in acceleration
        const deltaX = Math.abs(x - this.lastAcceleration.x);
        const deltaY = Math.abs(y - this.lastAcceleration.y);
        const deltaZ = Math.abs(z - this.lastAcceleration.z);

        // Total acceleration change
        const totalDelta = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

        // Update last values
        this.lastAcceleration = { x, y, z };

        // Check if motion exceeds threshold
        if (totalDelta > this.threshold) {
            this.registerShake();
        }
    };

    /**
     * Register a shake and check if trigger condition is met
     */
    private registerShake(): void {
        const now = Date.now();

        // Add current shake
        this.shakes.push(now);

        // Remove old shakes outside time window
        this.shakes = this.shakes.filter(
            (timestamp) => now - timestamp < this.timeWindow
        );

        // Check if we have enough shakes
        if (this.shakes.length >= this.shakeCount) {
            console.log('🚨 Shake SOS trigger detected!');
            this.onShakeDetected?.();

            // Clear shakes to prevent repeated triggers
            this.shakes = [];
        }
    }

    /**
     * Get detector status
     */
    getStatus(): {
        isListening: boolean;
        currentShakes: number;
        required: number;
    } {
        return {
            isListening: this.isListening,
            currentShakes: this.shakes.length,
            required: this.shakeCount,
        };
    }
}
