'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    CreditCard,
    Shield,
    QrCode,
    Fingerprint,
    Globe,
    Clock,
    CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context';
import { Card, CardContent, Badge, Spinner } from '@/components/ui';

export default function DigitalIdPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const digitalIdHash = 'ABHAYA-' + (user?.userId?.substring(0, 8) || 'XXXXXXXX').toUpperCase();

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="px-4 py-4 flex items-center gap-4">
                <Link href="/tourist/dashboard" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-semibold">Digital ID</h1>
            </header>

            {/* ID Card */}
            <div className="px-4 mb-6">
                <Card variant="elevated" className="overflow-hidden">
                    <div className="bg-gradient-to-br from-primary to-secondary p-4 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                <span className="font-bold">ABHAYA</span>
                            </div>
                            <Badge className="bg-white/20 text-white border-white/30">
                                Tourist ID
                            </Badge>
                        </div>

                        {/* User Info */}
                        <div className="mb-6">
                            <p className="text-white/70 text-xs mb-1">Tourist Name</p>
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-white/70 text-xs mb-1">ID Number</p>
                                <p className="font-mono font-semibold">{digitalIdHash}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-xs mb-1">Valid Until</p>
                                <p className="font-semibold">
                                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <CardContent className="p-4 text-center">
                        <div className="inline-block p-4 bg-white rounded-xl shadow-lg mb-4">
                            <div className="w-32 h-32 bg-black/10 rounded flex items-center justify-center">
                                <QrCode className="w-24 h-24 text-black/70" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Scan for verification</p>
                        <p className="text-xs text-muted-foreground mt-1">RFID-enabled for quick check-in</p>
                    </CardContent>
                </Card>
            </div>

            {/* Features */}
            <div className="px-4 space-y-3">
                <h3 className="font-semibold">Digital ID Features</h3>

                <Card variant="glass">
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-success/20">
                                    <CheckCircle className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium">Identity Verified</p>
                                    <p className="text-xs text-muted-foreground">Government ID validated</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <Fingerprint className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">Biometric Linked</p>
                                    <p className="text-xs text-muted-foreground">Fingerprint authentication enabled</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-secondary/20">
                                    <Globe className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <p className="font-medium">Tourist Registration</p>
                                    <p className="text-xs text-muted-foreground">Registered with local authorities</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-warning/20">
                                    <Clock className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                    <p className="font-medium">Real-time Tracking</p>
                                    <p className="text-xs text-muted-foreground">Location shared with safety network</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
