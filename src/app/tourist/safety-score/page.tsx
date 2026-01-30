'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Shield,
    ArrowLeft,
    Activity,
    MapPin,
    Clock,
    Users,
    Cloud,
    Wifi,
    Navigation,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Minus,
} from 'lucide-react';
import { useAuth, useSafety } from '@/context';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Spinner } from '@/components/ui';
import { cn, getSafetyColor, getSafetyLabel, formatRelativeTime } from '@/lib/utils';

interface FactorDisplay {
    key: string;
    label: string;
    icon: React.ElementType;
    value: number;
    description: string;
}

export default function SafetyScorePage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { score, level, factors, isLoading, refreshScore } = useSafety();
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [previousScore, setPreviousScore] = useState(score);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        refreshScore();
        setLastUpdated(new Date());
    }, [refreshScore]);

    const handleRefresh = useCallback(async () => {
        setPreviousScore(score);
        await refreshScore();
        setLastUpdated(new Date());
    }, [score, refreshScore]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const scoreDiff = score - previousScore;
    const TrendIcon = scoreDiff > 0 ? TrendingUp : scoreDiff < 0 ? TrendingDown : Minus;

    const factorDisplays: FactorDisplay[] = factors ? [
        { key: 'locationSafety', label: 'Location Safety', icon: MapPin, value: factors.locationSafety, description: 'Based on current area risk level' },
        { key: 'timeOfDay', label: 'Time of Day', icon: Clock, value: factors.timeOfDay, description: 'Safety varies by time' },
        { key: 'crowdDensity', label: 'Crowd Density', icon: Users, value: factors.crowdDensity, description: 'Area crowding level' },
        { key: 'weatherConditions', label: 'Weather', icon: Cloud, value: factors.weatherConditions, description: 'Current weather impact' },
        { key: 'networkConnectivity', label: 'Network', icon: Wifi, value: factors.networkConnectivity, description: 'Signal strength & connectivity' },
        { key: 'routeCompliance', label: 'Route Compliance', icon: Navigation, value: factors.routeCompliance, description: 'Following planned itinerary' },
    ] : [];

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="px-4 py-4 flex items-center gap-4">
                <Link href="/tourist/dashboard" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-semibold">Safety Score</h1>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                </Button>
            </header>

            {/* Main Score */}
            <div className="px-4 mb-6">
                <div className="safety-ring text-center py-8">
                    <div className="relative inline-block">
                        <div className={cn(
                            'w-36 h-36 rounded-full flex items-center justify-center mx-auto',
                            'bg-gradient-to-br shadow-glow-score',
                            level === 'excellent' || level === 'good' ? 'from-success/20 to-success/5' :
                                level === 'moderate' ? 'from-warning/20 to-warning/5' :
                                    'from-danger/20 to-danger/5'
                        )}>
                            <div className="text-center">
                                <Shield className={cn('w-8 h-8 mx-auto mb-1', getSafetyColor(score))} />
                                <span className={cn('text-4xl font-bold', getSafetyColor(score))}>{score}</span>
                            </div>
                        </div>

                        {/* Trend indicator */}
                        {scoreDiff !== 0 && (
                            <div className={cn(
                                'absolute -right-2 top-4 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                                scoreDiff > 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                            )}>
                                <TrendIcon className="w-3 h-3" />
                                {Math.abs(scoreDiff)}
                            </div>
                        )}
                    </div>

                    <Badge className="mt-4" variant={
                        level === 'excellent' || level === 'good' ? 'success' :
                            level === 'moderate' ? 'warning' : 'danger'
                    }>
                        {getSafetyLabel(score)}
                    </Badge>

                    <p className="text-sm text-muted-foreground mt-2">
                        Updated {formatRelativeTime(lastUpdated)}
                    </p>
                </div>
            </div>

            {/* Factors */}
            <div className="px-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Contributing Factors
                </h2>

                <div className="space-y-3">
                    {factorDisplays.map((factor) => (
                        <Card key={factor.key} variant="glass">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        'p-2 rounded-lg',
                                        factor.value >= 80 ? 'bg-success/20 text-success' :
                                            factor.value >= 60 ? 'bg-warning/20 text-warning' :
                                                'bg-danger/20 text-danger'
                                    )}>
                                        <factor.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{factor.label}</span>
                                            <span className={cn(
                                                'font-semibold',
                                                factor.value >= 80 ? 'text-success' :
                                                    factor.value >= 60 ? 'text-warning' : 'text-danger'
                                            )}>
                                                {Math.round(factor.value)}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{factor.description}</p>
                                        <div className="mt-2 h-1.5 bg-background-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all duration-500',
                                                    factor.value >= 80 ? 'bg-success' :
                                                        factor.value >= 60 ? 'bg-warning' : 'bg-danger'
                                                )}
                                                style={{ width: `${factor.value}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
