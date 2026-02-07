'use client';

import { useState, useEffect } from 'react';
import { isOnline, onNetworkChange } from '@/lib/serviceWorker';
import { getPendingActionsCount } from '@/lib/db/indexedDB';

export default function NetworkStatus() {
    const [online, setOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    useEffect(() => {
        // Initial status
        setOnline(isOnline());

        // Listen for network changes
        const cleanup = onNetworkChange((status) => {
            setOnline(status);
            if (status) {
                setLastSync(new Date());
            }
        });

        // Update pending count
        const updatePendingCount = async () => {
            const count = await getPendingActionsCount();
            setPendingCount(count);
        };

        updatePendingCount();
        const interval = setInterval(updatePendingCount, 5000);

        return () => {
            cleanup();
            clearInterval(interval);
        };
    }, []);

    if (online && pendingCount === 0) {
        return null; // Don't show anything when online with no pending actions
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            {!online && (
                <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
                    <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        You're offline - Some features may be limited
                    </span>
                </div>
            )}

            {online && pendingCount > 0 && (
                <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
                    <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Syncing {pendingCount} pending {pendingCount === 1 ? 'action' : 'actions'}...
                    </span>
                </div>
            )}

            {online && pendingCount === 0 && lastSync && (
                <div className="bg-green-600 text-white px-4 py-2 text-center text-sm font-medium animate-fade-out">
                    <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        All changes synced
                    </span>
                </div>
            )}
        </div>
    );
}
