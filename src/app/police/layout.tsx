'use client';

import { AuthProvider } from '@/context';
import { ToastProvider } from '@/components/ui';

export default function PoliceLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ToastProvider>
                <div className="min-h-screen bg-background">
                    {children}
                </div>
            </ToastProvider>
        </AuthProvider>
    );
}
