// IndexedDB wrapper for offline storage

const DB_NAME = 'abhaya-offline';
const DB_VERSION = 1;

// Object store names
export const STORES = {
    PROFILES: 'profiles',
    SOS_CONTACTS: 'sos_contacts',
    GEOFENCES: 'geofences',
    SAFETY_SCORES: 'safety_scores',
    PENDING_ACTIONS: 'pending_actions',
} as const;

// Initialize IndexedDB
export function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Profiles store
            if (!db.objectStoreNames.contains(STORES.PROFILES)) {
                const profileStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
                profileStore.createIndex('email', 'email', { unique: true });
                profileStore.createIndex('phone', 'phone', { unique: true });
            }

            // SOS Contacts store
            if (!db.objectStoreNames.contains(STORES.SOS_CONTACTS)) {
                const sosStore = db.createObjectStore(STORES.SOS_CONTACTS, { keyPath: 'id' });
                sosStore.createIndex('user_id', 'user_id', { unique: false });
            }

            // Geofences store
            if (!db.objectStoreNames.contains(STORES.GEOFENCES)) {
                const geofenceStore = db.createObjectStore(STORES.GEOFENCES, { keyPath: 'id' });
                geofenceStore.createIndex('user_id', 'user_id', { unique: false });
                geofenceStore.createIndex('status', 'status', { unique: false });
            }

            // Safety Scores store
            if (!db.objectStoreNames.contains(STORES.SAFETY_SCORES)) {
                const scoresStore = db.createObjectStore(STORES.SAFETY_SCORES, { keyPath: 'id' });
                scoresStore.createIndex('user_id', 'user_id', { unique: false });
                scoresStore.createIndex('created_at', 'created_at', { unique: false });
            }

            // Pending Actions store
            if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
                const actionsStore = db.createObjectStore(STORES.PENDING_ACTIONS, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                actionsStore.createIndex('action_type', 'action_type', { unique: false });
                actionsStore.createIndex('created_at', 'created_at', { unique: false });
                actionsStore.createIndex('status', 'status', { unique: false });
            }
        };
    });
}

// Generic CRUD operations
export class IndexedDBStore<T> {
    constructor(private storeName: string) { }

    async getAll(): Promise<T[]> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(id: string | number): Promise<T | undefined> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async add(data: T): Promise<IDBValidKey> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(data: T): Promise<IDBValidKey> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(id: string | number): Promise<void> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear(): Promise<void> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(indexName: string, value: any): Promise<T[]> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Pending action types
export interface PendingAction {
    id?: number;
    action_type: 'sos' | 'checkin' | 'incident' | 'location';
    endpoint: string;
    data: any;
    status: 'pending' | 'syncing' | 'failed';
    created_at: string;
    retry_count?: number;
}

// Store instances
export const profilesStore = new IndexedDBStore(STORES.PROFILES);
export const sosContactsStore = new IndexedDBStore(STORES.SOS_CONTACTS);
export const geofencesStore = new IndexedDBStore(STORES.GEOFENCES);
export const safetyScoresStore = new IndexedDBStore(STORES.SAFETY_SCORES);
export const pendingActionsStore = new IndexedDBStore<PendingAction>(STORES.PENDING_ACTIONS);

// Queue an action for background sync
export async function queueAction(action: Omit<PendingAction, 'id' | 'created_at' | 'status'>): Promise<void> {
    const pendingAction: PendingAction = {
        ...action,
        status: 'pending',
        created_at: new Date().toISOString(),
        retry_count: 0,
    };

    await pendingActionsStore.add(pendingAction);

    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        try {
            const registration = await navigator.serviceWorker.ready;
            // Type assertion for sync property
            if ('sync' in registration) {
                await (registration as any).sync.register('sync-pending-actions');
                console.log('Background sync registered');
            }
        } catch (error) {
            console.error('Failed to register background sync:', error);
        }
    }
}

// Get pending actions count
export async function getPendingActionsCount(): Promise<number> {
    const actions = await pendingActionsStore.getAll();
    return actions.filter(a => a.status === 'pending').length;
}
