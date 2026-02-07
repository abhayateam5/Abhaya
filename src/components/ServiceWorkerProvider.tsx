'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/serviceWorker';
import { NetworkStatus } from '@/components/Offline';

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Register service worker
        registerServiceWorker();
    }, []);

    return (
        <>
            <NetworkStatus />
            {children}
        </>
    );
}
