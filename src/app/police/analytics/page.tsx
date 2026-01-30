'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Users,
    AlertTriangle,
    Shield,
    Clock,
    MapPin,
    Activity,
    Calendar,
    Download,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AnalyticsData {
    totalTourists: number;
    activeTourists: number;
    totalAlerts: number;
    avgResponseTime: number;
    safetyTrend: number;
    hourlyActivity: number[];
    alertsByType: { type: string; count: number }[];
    topLocations: { name: string; tourists: number; alerts: number }[];
}

export default function PoliceAnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`/api/police/analytics?range=${timeRange}`);
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            // Use mock data
            setData({
                totalTourists: 1247,
                activeTourists: 892,
                totalAlerts: 34,
                avgResponseTime: 3.5,
                safetyTrend: 2.3,
                hourlyActivity: [45, 32, 28, 25, 22, 35, 78, 145, 234, 312, 345, 380, 356, 298, 267, 289, 312, 278, 234, 189, 145, 98, 67, 52],
                alertsByType: [
                    { type: 'SOS', count: 12 },
                    { type: 'Geo-fence', count: 8 },
                    { type: 'Anomaly', count: 7 },
                    { type: 'Health', count: 4 },
                    { type: 'Silent', count: 3 },
                ],
                topLocations: [
                    { name: 'India Gate', tourists: 234, alerts: 5 },
                    { name: 'Taj Mahal', tourists: 189, alerts: 3 },
                    { name: 'Red Fort', tourists: 156, alerts: 4 },
                    { name: 'Qutub Minar', tourists: 123, alerts: 2 },
                    { name: 'Lotus Temple', tourists: 98, alerts: 1 },
                ],
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const maxActivity = Math.max(...data.hourlyActivity);

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="px-4 py-4 flex items-center gap-4">
                <Link href="/police/dashboard" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-semibold flex-1">Analytics</h1>
                <Button size="sm" variant="secondary">
                    <Download className="w-4 h-4 mr-1" /> Export
                </Button>
            </header>

            {/* Time Range */}
            <div className="px-4 mb-4">
                <div className="flex gap-2">
                    {(['24h', '7d', '30d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm transition-colors',
                                timeRange === range
                                    ? 'bg-primary text-white'
                                    : 'bg-background-soft hover:bg-background-muted'
                            )}
                        >
                            {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="px-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Users className="w-5 h-5 text-primary" />
                                <Badge variant="success" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +5.2%
                                </Badge>
                            </div>
                            <p className="text-2xl font-bold">{data.activeTourists}</p>
                            <p className="text-xs text-muted-foreground">Active Tourists</p>
                        </CardContent>
                    </Card>

                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                                <Badge variant="warning" className="text-xs">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    -12%
                                </Badge>
                            </div>
                            <p className="text-2xl font-bold">{data.totalAlerts}</p>
                            <p className="text-xs text-muted-foreground">Total Alerts</p>
                        </CardContent>
                    </Card>

                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Clock className="w-5 h-5 text-success" />
                                <Badge variant="success" className="text-xs">Fast</Badge>
                            </div>
                            <p className="text-2xl font-bold">{data.avgResponseTime}m</p>
                            <p className="text-xs text-muted-foreground">Avg Response</p>
                        </CardContent>
                    </Card>

                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Shield className="w-5 h-5 text-primary" />
                                <Badge variant="success" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +{data.safetyTrend}%
                                </Badge>
                            </div>
                            <p className="text-2xl font-bold">78</p>
                            <p className="text-xs text-muted-foreground">Avg Safety Score</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="px-4 mb-6">
                <Card variant="glass">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5" /> Hourly Activity
                        </h3>
                        <div className="flex items-end gap-1 h-32">
                            {data.hourlyActivity.map((value, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                    <div
                                        className={cn(
                                            'w-full rounded-t transition-all',
                                            idx === new Date().getHours() ? 'bg-primary' : 'bg-primary/30'
                                        )}
                                        style={{ height: `${(value / maxActivity) * 100}%`, minHeight: 4 }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>12 AM</span>
                            <span>6 AM</span>
                            <span>12 PM</span>
                            <span>6 PM</span>
                            <span>11 PM</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts by Type */}
            <div className="px-4 mb-6">
                <Card variant="glass">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Alerts by Type
                        </h3>
                        <div className="space-y-3">
                            {data.alertsByType.map((item) => {
                                const maxCount = Math.max(...data.alertsByType.map(a => a.count));
                                return (
                                    <div key={item.type}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm">{item.type}</span>
                                            <span className="text-sm font-medium">{item.count}</span>
                                        </div>
                                        <div className="h-2 bg-background-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    item.type === 'SOS' ? 'bg-danger' :
                                                        item.type === 'Health' ? 'bg-pink-500' :
                                                            'bg-warning'
                                                )}
                                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Locations */}
            <div className="px-4 mb-6">
                <Card variant="glass">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Top Locations
                        </h3>
                        <div className="space-y-3">
                            {data.topLocations.map((location, idx) => (
                                <div key={location.name} className="flex items-center gap-3">
                                    <span className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                        idx === 0 ? 'bg-warning text-black' :
                                            idx === 1 ? 'bg-muted text-foreground' :
                                                idx === 2 ? 'bg-amber-700 text-white' :
                                                    'bg-background-muted'
                                    )}>
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium">{location.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {location.tourists} tourists • {location.alerts} alerts
                                        </p>
                                    </div>
                                    <Badge variant={location.alerts > 3 ? 'warning' : 'secondary'}>
                                        {location.alerts}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
