/**
 * Volume Button Detector
 * Detects 5 rapid volume button presses to trigger SOS
 * 
 * Note: This only works in native mobile apps, not in browsers
 * For web, this provides a keyboard simulation for testing
 */

export interface VolumeDetectorOptions {
    pressCount?: number; // Number of presses required (default: 5)
    timeWindow?: number; // Time window in ms (default: 3000)
    onVolumePatternDetected?: () => void;
}

export class VolumeDetector {
    private pressCount: number;
    private timeWindow: number;
    private onVolumePatternDetected?: () => void;

    private presses: number[] = []; // Timestamps of button presses
    private isListening = false;

    constructor(options: VolumeDetectorOptions = {}) {
        this.pressCount = options.pressCount || 5;
        this.timeWindow = options.timeWindow || 3000;
        this.onVolumePatternDetected = options.onVolumePatternDetected;
    }

    /**
     * Start listening for volume button pattern
     * In browser, listens for keyboard Volume Up/Down or +/- keys for testing
     */
    start(): boolean {
        if (typeof window === 'undefined') {
            console.warn('Window not available');
            return false;
        }

        // In web browsers, simulate with keyboard (for testing)
        window.addEventListener('keydown', this.handleKeyPress);
        this.isListening = true;

        console.log('Volume detector started (keyboard simulation mode)');
        console.log('Press Volume Up/Down or +/- keys 5 times within 3 seconds');

        return true;
    }

    /**
     * Stop listening
     */
    stop(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyPress);
        }
        this.isListening = false;
        this.presses = [];
    }

    /**
     * Handle keyboard presses (simulation for web)
     */
    private handleKeyPress = (event: KeyboardEvent): void => {
        // Volume keys on some keyboards
        const volumeKeys = ['AudioVolumeUp', 'AudioVolumeDown', '+', '-', '=', '_'];

        if (volumeKeys.includes(event.key)) {
            event.preventDefault();
            this.registerPress();
        }
    };

    /**
     * Register a volume button press
     */
    private registerPress(): void {
        const now = Date.now();

        // Add current press
        this.presses.push(now);

        // Remove old presses outside time window
        this.presses = this.presses.filter(
            (timestamp) => now - timestamp < this.timeWindow
        );

        console.log(`Volume press detected (${this.presses.length}/${this.pressCount})`);

        // Check if we have enough presses
        if (this.presses.length >= this.pressCount) {
            console.log('🚨 Volume button SOS trigger detected!');
            this.onVolumePatternDetected?.();

            // Clear presses to prevent repeated triggers
            this.presses = [];
        }
    }

    /**
     * Get detector status
     */
    getStatus(): {
        isListening: boolean;
        currentPresses: number;
        required: number;
    } {
        return {
            isListening: this.isListening,
            currentPresses: this.presses.length,
            required: this.pressCount,
        };
    }
}
