'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Map,
    Bell,
    Users,
    BarChart3,
    Shield,
    ArrowLeft,
    Layers,
    Clock,
    RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context';
import { Card, CardContent, Badge, Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { HeatmapData, HeatmapZone } from '@/types';

export default function HeatmapPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLayer, setSelectedLayer] = useState('risk');
    const [timeRange, setTimeRange] = useState(24);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'police')) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchHeatmapData();
    }, [timeRange]);

    const fetchHeatmapData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/police/heatmap?hours=${timeRange}`);
            const data = await res.json();
            if (data.success) {
                setHeatmapData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch heatmap:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const layers = [
        { id: 'risk', label: 'Risk Zones' },
        { id: 'tourists', label: 'Tourists' },
        { id: 'incidents', label: 'Incidents' },
        { id: 'patrols', label: 'Patrols' },
    ];

    const timeRanges = [
        { value: 1, label: '1h' },
        { value: 6, label: '6h' },
        { value: 24, label: '24h' },
        { value: 72, label: '72h' },
    ];

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return 'bg-success';
            case 'medium': return 'bg-warning';
            case 'high': return 'bg-danger';
            case 'critical': return 'bg-danger animate-pulse';
            default: return 'bg-muted';
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-background-soft border-r border-border p-4">
                <Link href="/police/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold">ABHAYA</span>
                        <p className="text-xs text-muted-foreground">Heatmap View</p>
                    </div>
                </div>

                {/* Layer Selection */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Layers
                    </h3>
                    <div className="space-y-2">
                        {layers.map((layer) => (
                            <button
                                key={layer.id}
                                onClick={() => setSelectedLayer(layer.id)}
                                className={cn(
                                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                    selectedLayer === layer.id
                                        ? 'bg-primary/20 text-primary'
                                        : 'text-muted-foreground hover:bg-background-muted'
                                )}
                            >
                                {layer.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Range */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time Range
                    </h3>
                    <div className="flex gap-2">
                        {timeRanges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setTimeRange(range.value)}
                                className={cn(
                                    'flex-1 py-1.5 rounded text-xs font-medium transition-colors',
                                    timeRange === range.value
                                        ? 'bg-primary text-white'
                                        : 'bg-background-muted text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Risk Legend</h3>
                    <div className="heatmap-legend flex-col gap-2">
                        <div className="legend-item">
                            <div className="legend-dot bg-success" />
                            <span>Low Risk</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot bg-warning" />
                            <span>Medium Risk</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot bg-danger" />
                            <span>High Risk</span>
                        </div>
                    </div>
                </div>

                <Button onClick={fetchHeatmapData} variant="secondary" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                </Button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Real-Time Heatmap</h1>
                        <p className="text-sm text-muted-foreground">
                            Last updated: {heatmapData?.lastUpdated ? new Date(heatmapData.lastUpdated).toLocaleTimeString() : 'N/A'}
                        </p>
                    </div>

                    {/* Map Placeholder */}
                    <Card variant="glass" className="flex-1 mb-4">
                        <CardContent className="h-full flex items-center justify-center p-0">
                            <div className="relative w-full h-full min-h-[400px] bg-background-muted rounded-lg flex items-center justify-center">
                                <Map className="w-24 h-24 text-muted-foreground opacity-20" />
                                <p className="absolute text-muted-foreground">Interactive Map Area</p>

                                {/* Zone indicators */}
                                {heatmapData?.zones.map((zone, idx) => (
                                    <div
                                        key={zone.id}
                                        className="absolute"
                                        style={{
                                            top: `${20 + (idx * 15)}%`,
                                            left: `${15 + (idx * 12)}%`,
                                        }}
                                    >
                                        <div className={cn('w-8 h-8 rounded-full opacity-60', getRiskColor(zone.riskLevel))} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Zone List */}
                    <div className="grid grid-cols-3 gap-3">
                        {heatmapData?.zones.slice(0, 6).map((zone) => (
                            <Card key={zone.id} variant="glass">
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-sm">{zone.name}</h4>
                                            <p className="text-xs text-muted-foreground">{zone.touristCount} tourists</p>
                                        </div>
                                        <Badge
                                            variant={
                                                zone.riskLevel === 'low' ? 'success' :
                                                    zone.riskLevel === 'medium' ? 'warning' : 'danger'
                                            }
                                        >
                                            {zone.riskLevel}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
