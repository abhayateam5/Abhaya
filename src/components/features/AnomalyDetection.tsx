'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    X,
    Activity,
    MapPin,
    Clock,
    Eye,
    Shield,
    TrendingUp,
    Bell,
    CheckCircle,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Modal } from '@/components/ui';
import { cn, formatRelativeTime } from '@/lib/utils';

interface AnomalyDetectionProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: { latitude: number; longitude: number };
}

interface Anomaly {
    id: string;
    type: 'pattern' | 'location' | 'behavior' | 'health' | 'device';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    detectedAt: Date;
    isAcknowledged: boolean;
    confidence: number;
}

const MOCK_ANOMALIES: Anomaly[] = [
    {
        id: '1',
        type: 'location',
        severity: 'medium',
        title: 'Unusual Location Pattern',
        description: 'You have been stationary in an unfamiliar area for 45 minutes',
        detectedAt: new Date(Date.now() - 1800000),
        isAcknowledged: false,
        confidence: 78,
    },
    {
        id: '2',
        type: 'behavior',
        severity: 'low',
        title: 'Route Deviation Detected',
        description: 'Your current route differs from your planned itinerary',
        detectedAt: new Date(Date.now() - 3600000),
        isAcknowledged: true,
        confidence: 85,
    },
    {
        id: '3',
        type: 'device',
        severity: 'low',
        title: 'Low Battery Warning',
        description: 'Wristband battery at 15%, ensure charging for safety features',
        detectedAt: new Date(Date.now() - 7200000),
        isAcknowledged: true,
        confidence: 100,
    },
];

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'critical': return 'danger';
        case 'high': return 'danger';
        case 'medium': return 'warning';
        default: return 'secondary';
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'location': return MapPin;
        case 'behavior': return TrendingUp;
        case 'health': return Activity;
        case 'device': return Bell;
        default: return AlertTriangle;
    }
};

export function AnomalyDetection({ isOpen, onClose, userLocation }: AnomalyDetectionProps) {
    const [anomalies, setAnomalies] = useState<Anomaly[]>(MOCK_ANOMALIES);
    const [isMonitoring, setIsMonitoring] = useState(true);

    const unacknowledgedCount = anomalies.filter(a => !a.isAcknowledged).length;

    const handleAcknowledge = (id: string) => {
        setAnomalies(prev => prev.map(a =>
            a.id === id ? { ...a, isAcknowledged: true } : a
        ));
    };

    const handleAcknowledgeAll = () => {
        setAnomalies(prev => prev.map(a => ({ ...a, isAcknowledged: true })));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <header className="px-4 py-4 border-b border-border flex items-center gap-3">
                <button onClick={onClose} className="text-muted-foreground">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold flex items-center gap-2">
                        Anomaly Detection
                        {unacknowledgedCount > 0 && (
                            <Badge variant="danger">{unacknowledgedCount}</Badge>
                        )}
                    </h2>
                    <p className="text-xs text-muted-foreground">AI-powered safety monitoring</p>
                </div>
                <div className={cn(
                    'px-3 py-1 rounded-full text-xs flex items-center gap-1',
                    isMonitoring ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                )}>
                    <span className={cn('w-2 h-2 rounded-full', isMonitoring ? 'bg-success animate-pulse' : 'bg-muted')} />
                    {isMonitoring ? 'Monitoring' : 'Paused'}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Status Card */}
                <Card variant="elevated" className="bg-gradient-to-r from-primary/20 to-secondary/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/20">
                                <Eye className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">AI Safety Monitor</h3>
                                <p className="text-sm text-muted-foreground">
                                    Analyzing patterns from location, behavior, and health data
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-success">128</p>
                                <p className="text-xs text-muted-foreground">Safe Patterns</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-warning">{anomalies.length}</p>
                                <p className="text-xs text-muted-foreground">Anomalies</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">24h</p>
                                <p className="text-xs text-muted-foreground">Monitored</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Monitoring Types */}
                <div>
                    <h3 className="font-semibold mb-3">Active Monitoring</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: MapPin, label: 'Location', status: 'Active' },
                            { icon: TrendingUp, label: 'Behavior', status: 'Active' },
                            { icon: Activity, label: 'Health', status: 'Active' },
                            { icon: Shield, label: 'Geo-fence', status: 'Active' },
                        ].map((item, idx) => (
                            <Card key={idx} variant="glass">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-success/20">
                                        <item.icon className="w-5 h-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.label}</p>
                                        <p className="text-xs text-success">{item.status}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Anomalies List */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Detected Anomalies</h3>
                        {unacknowledgedCount > 0 && (
                            <Button size="sm" variant="secondary" onClick={handleAcknowledgeAll}>
                                Acknowledge All
                            </Button>
                        )}
                    </div>

                    {anomalies.length === 0 ? (
                        <Card variant="glass">
                            <CardContent className="p-8 text-center">
                                <CheckCircle className="w-12 h-12 mx-auto text-success mb-3" />
                                <p className="font-medium">All Clear!</p>
                                <p className="text-sm text-muted-foreground">No anomalies detected</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {anomalies.map((anomaly) => {
                                const Icon = getTypeIcon(anomaly.type);
                                return (
                                    <Card
                                        key={anomaly.id}
                                        variant="glass"
                                        className={cn(
                                            'border-l-4',
                                            anomaly.severity === 'critical' || anomaly.severity === 'high'
                                                ? 'border-l-danger'
                                                : anomaly.severity === 'medium'
                                                    ? 'border-l-warning'
                                                    : 'border-l-muted'
                                        )}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    'p-2 rounded-lg',
                                                    anomaly.isAcknowledged ? 'bg-muted' : 'bg-warning/20'
                                                )}>
                                                    <Icon className={cn(
                                                        'w-5 h-5',
                                                        anomaly.isAcknowledged ? 'text-muted-foreground' : 'text-warning'
                                                    )} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={cn(
                                                            'font-medium',
                                                            anomaly.isAcknowledged && 'text-muted-foreground'
                                                        )}>
                                                            {anomaly.title}
                                                        </span>
                                                        <Badge variant={getSeverityColor(anomaly.severity) as 'secondary' | 'warning' | 'danger'}>
                                                            {anomaly.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatRelativeTime(anomaly.detectedAt)}
                                                            </span>
                                                            <span>Confidence: {anomaly.confidence}%</span>
                                                        </div>
                                                        {!anomaly.isAcknowledged && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleAcknowledge(anomaly.id)}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-1" /> Acknowledge
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Info */}
                <Card variant="glass" className="border-primary/30">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="font-medium">How It Works</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Our AI continuously learns your normal patterns and alerts you when
                                    something unusual is detected. High-severity anomalies automatically
                                    notify emergency contacts and police if unacknowledged within 5 minutes.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AnomalyDetection;
