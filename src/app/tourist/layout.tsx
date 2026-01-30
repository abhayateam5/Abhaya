'use client';

import { AuthProvider, LocationProvider, SafetyProvider, SOSProvider } from '@/context';
import { ToastProvider } from '@/components/ui';

export default function TouristLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LocationProvider>
                <SafetyProvider>
                    <SOSProvider>
                        <ToastProvider>
                            <div className="min-h-screen bg-background">
                                {children}
                            </div>
                        </ToastProvider>
                    </SOSProvider>
                </SafetyProvider>
            </LocationProvider>
        </AuthProvider>
    );
}
