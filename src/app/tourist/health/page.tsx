'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Heart,
    Activity,
    Thermometer,
    Footprints,
    Watch,
    Bluetooth,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context';
import { Card, CardContent, Button, Badge, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

interface VitalSigns {
    heartRate: number;
    spO2: number;
    temperature: number;
    steps: number;
    lastSynced: Date;
}

export default function HealthPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [vitals, setVitals] = useState<VitalSigns | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        // Simulate wristband connection and data
        simulateWristbandData();
    }, []);

    const simulateWristbandData = () => {
        setIsConnected(true);
        setVitals({
            heartRate: 72 + Math.floor(Math.random() * 15),
            spO2: 96 + Math.floor(Math.random() * 3),
            temperature: 36.2 + Math.random() * 0.8,
            steps: 4500 + Math.floor(Math.random() * 3000),
            lastSynced: new Date(),
        });
    };

    const handleSync = async () => {
        setIsSyncing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        simulateWristbandData();
        setIsSyncing(false);
    };

    const getHeartRateStatus = (hr: number) => {
        if (hr < 60) return { label: 'Low', color: 'warning' };
        if (hr > 100) return { label: 'High', color: 'danger' };
        return { label: 'Normal', color: 'success' };
    };

    const getSpO2Status = (spo2: number) => {
        if (spo2 < 95) return { label: 'Low', color: 'danger' };
        if (spo2 < 97) return { label: 'Normal', color: 'warning' };
        return { label: 'Excellent', color: 'success' };
    };

    const getTempStatus = (temp: number) => {
        if (temp < 36) return { label: 'Low', color: 'warning' };
        if (temp > 37.5) return { label: 'Fever', color: 'danger' };
        return { label: 'Normal', color: 'success' };
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const hrStatus = vitals ? getHeartRateStatus(vitals.heartRate) : null;
    const spo2Status = vitals ? getSpO2Status(vitals.spO2) : null;
    const tempStatus = vitals ? getTempStatus(vitals.temperature) : null;

    return (
        <div className="min-h-screen pb-20">
            <header className="px-4 py-4 flex items-center gap-4">
                <Link href="/tourist/dashboard" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-semibold">Health Monitor</h1>
            </header>

            {/* Wristband Status */}
            <div className="px-4 mb-6">
                <Card variant="glass">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'p-2 rounded-lg',
                                    isConnected ? 'bg-success/20' : 'bg-danger/20'
                                )}>
                                    <Watch className={cn('w-5 h-5', isConnected ? 'text-success' : 'text-danger')} />
                                </div>
                                <div>
                                    <p className="font-medium">ABHAYA Wristband</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Bluetooth className={cn('w-3 h-3', isConnected ? 'text-success' : 'text-muted-foreground')} />
                                        <span className={isConnected ? 'text-success' : 'text-muted-foreground'}>
                                            {isConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" variant="secondary" onClick={handleSync} disabled={isSyncing}>
                                <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
                            </Button>
                        </div>
                        {vitals && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Last synced: {vitals.lastSynced.toLocaleTimeString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Vital Signs */}
            {vitals ? (
                <div className="px-4 space-y-4">
                    <h2 className="text-lg font-semibold">Vital Signs</h2>

                    {/* Heart Rate */}
                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-danger/20">
                                    <Heart className="w-8 h-8 text-danger" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Heart Rate</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{vitals.heartRate}</span>
                                        <span className="text-muted-foreground">BPM</span>
                                    </div>
                                </div>
                                <Badge variant={hrStatus?.color as 'success' | 'warning' | 'danger'}>
                                    {hrStatus?.label}
                                </Badge>
                            </div>
                            <div className="mt-3 h-1 bg-background-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-danger transition-all"
                                    style={{ width: `${Math.min((vitals.heartRate / 150) * 100, 100)}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* SpO2 */}
                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/20">
                                    <Activity className="w-8 h-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Blood Oxygen (SpO2)</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{vitals.spO2}</span>
                                        <span className="text-muted-foreground">%</span>
                                    </div>
                                </div>
                                <Badge variant={spo2Status?.color as 'success' | 'warning' | 'danger'}>
                                    {spo2Status?.label}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Temperature */}
                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-warning/20">
                                    <Thermometer className="w-8 h-8 text-warning" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Body Temperature</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{vitals.temperature.toFixed(1)}</span>
                                        <span className="text-muted-foreground">°C</span>
                                    </div>
                                </div>
                                <Badge variant={tempStatus?.color as 'success' | 'warning' | 'danger'}>
                                    {tempStatus?.label}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Steps */}
                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-success/20">
                                    <Footprints className="w-8 h-8 text-success" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Steps Today</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{vitals.steps.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Goal</p>
                                    <p className="font-medium">10,000</p>
                                </div>
                            </div>
                            <div className="mt-3 h-2 bg-background-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-success transition-all"
                                    style={{ width: `${Math.min((vitals.steps / 10000) * 100, 100)}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Health Alert */}
                    <Card variant="glass" className="border-warning/30">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                                <div>
                                    <p className="font-medium text-warning">Health Monitoring Active</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your vital signs are being monitored. Any anomalies will trigger an automatic alert.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="px-4 text-center py-12">
                    <Watch className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">Connect your wristband</p>
                    <Button className="mt-4" onClick={() => setIsConnected(true)}>
                        <Bluetooth className="w-4 h-4 mr-2" /> Pair Device
                    </Button>
                </div>
            )}
        </div>
    );
}
