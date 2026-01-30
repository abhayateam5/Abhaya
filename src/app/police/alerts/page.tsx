'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Shield,
    Bell,
    AlertTriangle,
    MapPin,
    Clock,
    Phone,
    User,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useAuth } from '@/context';
import { Card, CardContent, Badge, Button, Spinner } from '@/components/ui';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Alert } from '@/types';

export default function AlertsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [alerts, setAlerts] = useState<Partial<Alert>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('active');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'police')) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchAlerts();
    }, [filter]);

    const fetchAlerts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/police/alerts?status=${filter}`);
            const data = await res.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateAlert = async (alertId: string, status: string) => {
        try {
            await fetch('/api/police/alerts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId, status }),
            });
            fetchAlerts();
        } catch (error) {
            console.error('Failed to update alert:', error);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const filters = [
        { id: 'active', label: 'Active' },
        { id: 'responding', label: 'Responding' },
        { id: 'resolved', label: 'Resolved' },
        { id: 'all', label: 'All' },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return 'default';
            default: return 'secondary';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'sos': return AlertTriangle;
            case 'silent': return Bell;
            default: return MapPin;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-background-soft border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/police/dashboard" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">Alert Management</h1>
                                <p className="text-xs text-muted-foreground">ABHAYA Command Center</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        {filters.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                    filter === f.id
                                        ? 'bg-primary text-white'
                                        : 'bg-background-muted text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-6">
                {alerts.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <p className="text-muted-foreground">No alerts found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => {
                            const TypeIcon = getTypeIcon(alert.type || 'sos');
                            return (
                                <Card
                                    key={alert._id}
                                    variant="glass"
                                    className={cn(
                                        'transition-all',
                                        alert.status === 'active' && alert.priority === 'critical' && 'border-danger animate-pulse'
                                    )}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={cn(
                                                'p-3 rounded-lg',
                                                alert.priority === 'critical' ? 'bg-danger/20' :
                                                    alert.priority === 'high' ? 'bg-warning/20' : 'bg-primary/20'
                                            )}>
                                                <TypeIcon className={cn(
                                                    'w-6 h-6',
                                                    alert.priority === 'critical' ? 'text-danger' :
                                                        alert.priority === 'high' ? 'text-warning' : 'text-primary'
                                                )} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">{alert.type?.toUpperCase()} Alert</span>
                                                    <Badge variant={getPriorityColor(alert.priority || 'medium') as 'danger' | 'warning' | 'default' | 'secondary'}>
                                                        {alert.priority}
                                                    </Badge>
                                                    <Badge variant={
                                                        alert.status === 'active' ? 'danger' :
                                                            alert.status === 'responding' ? 'warning' : 'success'
                                                    }>
                                                        {alert.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {alert.touristName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-4 h-4" />
                                                        {alert.touristPhone}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {formatRelativeTime(alert.createdAt || new Date())}
                                                    </span>
                                                </div>

                                                {alert.address && (
                                                    <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                                        <MapPin className="w-4 h-4" />
                                                        {alert.address}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {alert.status === 'active' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateAlert(alert._id!, 'responding')}
                                                    >
                                                        Respond
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleUpdateAlert(alert._id!, 'false_alarm')}
                                                    >
                                                        False Alarm
                                                    </Button>
                                                </div>
                                            )}
                                            {alert.status === 'responding' && (
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => handleUpdateAlert(alert._id!, 'resolved')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
