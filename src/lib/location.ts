/**
 * ABHAYA Location Tracking System
 * Intelligent location tracking with battery optimization
 */

// ============================================================================
// TYPES
// ============================================================================

export type TrackingMode = 'high_accuracy' | 'balanced' | 'low_power' | 'stealth';

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    timestamp: number;
}

export interface TrackedLocation extends LocationData {
    user_id: string;
    mode: TrackingMode;
    battery_level?: number;
    is_spoofed?: boolean;
}

export interface OfflineLocation {
    id: string;
    location: LocationData;
    queued_at: number;
}

// ============================================================================
// TRACKING CONFIGURATION
// ============================================================================

export const TRACKING_INTERVALS: Record<TrackingMode, number> = {
    high_accuracy: 5000,      // 5 seconds (SOS mode)
    balanced: 30000,          // 30 seconds (normal)
    low_power: 300000,        // 5 minutes (idle)
    stealth: 10000,           // 10 seconds (silent SOS)
};

export const TRACKING_OPTIONS: Record<TrackingMode, PositionOptions> = {
    high_accuracy: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    },
    balanced: {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
    },
    low_power: {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
    },
    stealth: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    },
};

// ============================================================================
// LOCATION TRACKING STATE
// ============================================================================

let trackingInterval: NodeJS.Timeout | null = null;
let currentMode: TrackingMode = 'balanced';
let offlineQueue: OfflineLocation[] = [];

// ============================================================================
// CORE TRACKING FUNCTIONS
// ============================================================================

/**
 * Get current location
 * @param mode Tracking mode
 * @returns Location data or error
 */
export async function getCurrentLocation(mode: TrackingMode = 'balanced'): Promise<{
    data: LocationData | null;
    error: string | null;
}> {
    if (!navigator.geolocation) {
        return { data: null, error: 'Geolocation not supported' };
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location: LocationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude || undefined,
                    speed: position.coords.speed || undefined,
                    heading: position.coords.heading || undefined,
                    timestamp: position.timestamp,
                };

                resolve({ data: location, error: null });
            },
            (error) => {
                console.error('Geolocation error:', error);
                resolve({ data: null, error: error.message });
            },
            TRACKING_OPTIONS[mode]
        );
    });
}

/**
 * Start location tracking
 * @param mode Tracking mode
 * @param onUpdate Callback for location updates
 */
export function startTracking(
    mode: TrackingMode,
    onUpdate: (location: LocationData) => void
): void {
    // Stop existing tracking
    stopTracking();

    currentMode = mode;
    const interval = TRACKING_INTERVALS[mode];

    // Initial location
    getCurrentLocation(mode).then(({ data }) => {
        if (data) onUpdate(data);
    });

    // Set up interval tracking
    trackingInterval = setInterval(async () => {
        const { data } = await getCurrentLocation(mode);
        if (data) onUpdate(data);
    }, interval);

    console.log(`Location tracking started in ${mode} mode (${interval}ms interval)`);
}

/**
 * Stop location tracking
 */
export function stopTracking(): void {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
        console.log('Location tracking stopped');
    }
}

/**
 * Update tracking mode
 * @param mode New tracking mode
 * @param onUpdate Callback for location updates
 */
export function updateTrackingMode(
    mode: TrackingMode,
    onUpdate: (location: LocationData) => void
): void {
    if (currentMode !== mode) {
        console.log(`Switching tracking mode: ${currentMode} → ${mode}`);
        startTracking(mode, onUpdate);
    }
}

// ============================================================================
// GPS VALIDATION
// ============================================================================

const MAX_SPEED_KM_PER_MIN = 100; // Maximum realistic speed (e.g., airplane)
let lastValidLocation: LocationData | null = null;

/**
 * Detect GPS spoofing based on impossible speed
 * @param location Current location
 * @returns True if location appears spoofed
 */
export function detectGPSSpoofing(location: LocationData): boolean {
    if (!lastValidLocation) {
        lastValidLocation = location;
        return false;
    }

    // Calculate distance in km
    const distance = calculateDistance(
        lastValidLocation.latitude,
        lastValidLocation.longitude,
        location.latitude,
        location.longitude
    );

    // Calculate time difference in minutes
    const timeDiff = (location.timestamp - lastValidLocation.timestamp) / 60000;

    if (timeDiff === 0) return false;

    // Calculate speed in km/min
    const speed = distance / timeDiff;

    // Flag if speed exceeds maximum realistic speed
    const isSpoofed = speed > MAX_SPEED_KM_PER_MIN;

    if (!isSpoofed) {
        lastValidLocation = location;
    }

    if (isSpoofed) {
        console.warn(`GPS spoofing detected: ${speed.toFixed(2)} km/min (max: ${MAX_SPEED_KM_PER_MIN})`);
    }

    return isSpoofed;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 Latitude 1
 * @param lon1 Longitude 1
 * @param lat2 Latitude 2
 * @param lon2 Longitude 2
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

// ============================================================================
// OFFLINE QUEUE
// ============================================================================

const OFFLINE_QUEUE_KEY = 'abhaya_offline_locations';

/**
 * Queue location for offline sync
 * @param location Location data
 */
export function queueOfflineLocation(location: LocationData): void {
    const offlineLocation: OfflineLocation = {
        id: `${Date.now()}_${Math.random()}`,
        location,
        queued_at: Date.now(),
    };

    offlineQueue.push(offlineLocation);

    // Persist to localStorage
    try {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
        console.log('Location queued for offline sync:', offlineLocation.id);
    } catch (error) {
        console.error('Failed to queue offline location:', error);
    }
}

/**
 * Load offline queue from localStorage
 */
export function loadOfflineQueue(): void {
    try {
        const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (stored) {
            offlineQueue = JSON.parse(stored);
            console.log(`Loaded ${offlineQueue.length} offline locations`);
        }
    } catch (error) {
        console.error('Failed to load offline queue:', error);
    }
}

/**
 * Sync offline locations to server
 * @returns Success status
 */
export async function syncOfflineLocations(): Promise<{ success: boolean; synced: number }> {
    if (offlineQueue.length === 0) {
        return { success: true, synced: 0 };
    }

    try {
        const response = await fetch('/api/location/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locations: offlineQueue.map((q) => q.location) }),
        });

        if (!response.ok) {
            throw new Error('Failed to sync offline locations');
        }

        const synced = offlineQueue.length;
        offlineQueue = [];
        localStorage.removeItem(OFFLINE_QUEUE_KEY);

        console.log(`Synced ${synced} offline locations`);
        return { success: true, synced };
    } catch (error) {
        console.error('Failed to sync offline locations:', error);
        return { success: false, synced: 0 };
    }
}

/**
 * Get offline queue size
 */
export function getOfflineQueueSize(): number {
    return offlineQueue.length;
}

// ============================================================================
// LOCATION UPDATE
// ============================================================================

/**
 * Update location to server
 * @param location Location data
 * @param mode Tracking mode
 * @returns Success status
 */
export async function updateLocation(
    location: LocationData,
    mode: TrackingMode
): Promise<{ success: boolean; error?: string }> {
    // Check for GPS spoofing
    const isSpoofed = detectGPSSpoofing(location);

    // If offline, queue for later
    if (!navigator.onLine) {
        queueOfflineLocation(location);
        return { success: true };
    }

    try {
        const response = await fetch('/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                altitude: location.altitude,
                speed: location.speed,
                heading: location.heading,
                mode,
                is_spoofed: isSpoofed,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update location');
        }

        return { success: true };
    } catch (error: any) {
        console.error('Failed to update location:', error);

        // Queue for offline sync
        queueOfflineLocation(location);

        return { success: false, error: error.message };
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Load offline queue on module load
if (typeof window !== 'undefined') {
    loadOfflineQueue();

    // Auto-sync when coming back online
    window.addEventListener('online', () => {
        console.log('Back online, syncing offline locations...');
        syncOfflineLocations();
    });
}
