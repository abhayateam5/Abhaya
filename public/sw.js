// ABHAYA Service Worker
// Provides offline functionality and caching

const CACHE_VERSION = 'abhaya-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const OFFLINE_PAGE = '/offline.html';

// Static assets to precache
const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Precaching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );

    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('abhaya-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );

    // Take control immediately
    return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // API requests - Network First with offline fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Static assets - Cache First
    if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2)$/)
    ) {
        event.respondWith(cacheFirstStrategy(request));
        return;
    }

    // HTML pages - Network First with cache fallback
    event.respondWith(networkFirstStrategy(request));
});

// Cache First Strategy
async function cacheFirstStrategy(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Cache first failed:', error);
        throw error;
    }
}

// Network First Strategy
async function networkFirstStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);

    try {
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlinePage = await cache.match(OFFLINE_PAGE);
            if (offlinePage) {
                return offlinePage;
            }
        }

        throw error;
    }
}

// Background Sync
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync event:', event.tag);

    if (event.tag === 'sync-pending-actions') {
        event.waitUntil(syncPendingActions());
    }
});

// Sync pending actions from IndexedDB
async function syncPendingActions() {
    console.log('[SW] Syncing pending actions...');

    try {
        // Open IndexedDB
        const db = await openDB();
        const tx = db.transaction('pending_actions', 'readonly');
        const store = tx.objectStore('pending_actions');
        const actions = await store.getAll();

        console.log('[SW] Found pending actions:', actions.length);

        // Process each action
        for (const action of actions) {
            try {
                await processAction(action);

                // Remove from queue on success
                const deleteTx = db.transaction('pending_actions', 'readwrite');
                await deleteTx.objectStore('pending_actions').delete(action.id);
            } catch (error) {
                console.error('[SW] Failed to sync action:', action, error);
            }
        }

        console.log('[SW] Sync complete');
    } catch (error) {
        console.error('[SW] Sync failed:', error);
        throw error;
    }
}

// Process individual action
async function processAction(action) {
    const { type, data, endpoint } = action;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to sync ${type}: ${response.statusText}`);
    }

    return response.json();
}

// Open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('abhaya-offline', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('pending_actions')) {
                const store = db.createObjectStore('pending_actions', { keyPath: 'id', autoIncrement: true });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('created_at', 'created_at', { unique: false });
            }
        };
    });
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'ABHAYA';
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        data: data.url,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data || '/';

    event.waitUntil(
        clients.openWindow(url)
    );
});
