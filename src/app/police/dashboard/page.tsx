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
    LogOut,
    Shield,
    AlertTriangle,
    UserCheck,
    Activity,
    MapPin,
    Clock,
} from 'lucide-react';
import { useAuth } from '@/context';
import { Card, CardContent, Badge, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

export default function PoliceDashboard() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'police')) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/police/analytics');
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
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

    const navItems = [
        { href: '/police/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
        { href: '/police/heatmap', label: 'Heatmap', icon: Map },
        { href: '/police/alerts', label: 'Alerts', icon: Bell, badge: stats?.activeSOS },
        { href: '/police/tourists', label: 'Tourists', icon: Users },
        { href: '/police/analytics', label: 'Analytics', icon: BarChart3 },
    ];

    const statCards = [
        { label: 'Total Tourists', value: stats?.totalTourists || 0, icon: Users, color: 'text-primary', bgColor: 'bg-primary/20' },
        { label: 'Active SOS', value: stats?.activeSOS || 0, icon: AlertTriangle, color: 'text-danger', bgColor: 'bg-danger/20' },
        { label: 'Active Patrols', value: stats?.activePatrols || 0, icon: UserCheck, color: 'text-success', bgColor: 'bg-success/20' },
        { label: 'Avg Safety Score', value: stats?.averageSafetyScore || 0, icon: Shield, color: 'text-secondary', bgColor: 'bg-secondary/20' },
        { label: 'Incidents Today', value: stats?.incidentsToday || 0, icon: Activity, color: 'text-warning', bgColor: 'bg-warning/20' },
        { label: 'High Risk Zones', value: stats?.highRiskZones || 0, icon: MapPin, color: 'text-danger', bgColor: 'bg-danger/20' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-background-soft border-r border-border p-4 flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg">ABHAYA</span>
                        <p className="text-xs text-muted-foreground">Command Center</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                    item.active
                                        ? 'bg-primary/20 text-primary'
                                        : 'text-muted-foreground hover:bg-background-muted hover:text-foreground'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="flex-1">{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <Badge variant="danger" className="ml-auto">
                                        {item.badge}
                                    </Badge>
                                )}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-semibold">
                            {user?.name?.charAt(0) || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name || 'Officer'}</p>
                            <p className="text-xs text-muted-foreground">Police Officer</p>
                        </div>
                        <button
                            onClick={() => router.push('/login')}
                            className="p-2 text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Command Center Dashboard</h1>
                        <p className="text-muted-foreground">Real-time tourist safety monitoring</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Last updated: Just now</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {statCards.map((stat) => (
                        <Card key={stat.label} variant="glass">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        <p className={cn('text-3xl font-bold mt-1', stat.color)}>{stat.value}</p>
                                    </div>
                                    <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                                        <stat.icon className={cn('w-5 h-5', stat.color)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card variant="glass" className="hover:border-primary transition-colors cursor-pointer">
                        <Link href="/police/heatmap">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-primary/20">
                                        <Map className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Live Heatmap</h3>
                                        <p className="text-muted-foreground text-sm">View real-time tourist distribution and risk zones</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card variant="glass" className="hover:border-danger transition-colors cursor-pointer">
                        <Link href="/police/alerts">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-danger/20">
                                        <Bell className="w-8 h-8 text-danger" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Active Alerts</h3>
                                        <p className="text-muted-foreground text-sm">
                                            {stats?.activeSOS || 0} SOS alerts requiring attention
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                </div>
            </main>
        </div>
    );
}
