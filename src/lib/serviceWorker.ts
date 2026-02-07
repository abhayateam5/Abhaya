// Service Worker registration and management

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });

        console.log('Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Service Worker update found');

            newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New Service Worker available');
                    // Notify user about update
                    window.dispatchEvent(new CustomEvent('sw-update-available'));
                }
            });
        });

        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
}

// Unregister service worker
export async function unregisterServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            const success = await registration.unregister();
            console.log('Service Worker unregistered:', success);
            return success;
        }
        return false;
    } catch (error) {
        console.error('Service Worker unregistration failed:', error);
        return false;
    }
}

// Check if service worker is active
export async function isServiceWorkerActive(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration?.active;
    } catch (error) {
        return false;
    }
}

// Update service worker
export async function updateServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            await registration.update();
            console.log('Service Worker update check complete');
        }
    } catch (error) {
        console.error('Service Worker update failed:', error);
    }
}

// Skip waiting and activate new service worker
export function skipWaiting(): void {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
}

// Network status monitoring
export function isOnline(): boolean {
    return navigator.onLine;
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}
