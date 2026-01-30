'use client';

import { useState, useEffect } from 'react';
import {
    Map,
    X,
    Plus,
    MapPin,
    Circle,
    Bell,
    Shield,
    Trash2,
    Edit2,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Badge, Modal } from '@/components/ui';
import { cn } from '@/lib/utils';

interface GeoFenceSystemProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: { latitude: number; longitude: number };
}

interface GeoZone {
    id: string;
    name: string;
    type: 'safe' | 'caution' | 'danger' | 'custom';
    center: { latitude: number; longitude: number };
    radius: number; // meters
    isActive: boolean;
    alertOnEnter: boolean;
    alertOnExit: boolean;
}

const PRESET_ZONES: GeoZone[] = [
    {
        id: 'hotel',
        name: 'My Hotel',
        type: 'safe',
        center: { latitude: 28.6139, longitude: 77.2090 },
        radius: 200,
        isActive: true,
        alertOnEnter: false,
        alertOnExit: true,
    },
    {
        id: 'embassy',
        name: 'Embassy Area',
        type: 'safe',
        center: { latitude: 28.5921, longitude: 77.2106 },
        radius: 500,
        isActive: true,
        alertOnEnter: false,
        alertOnExit: false,
    },
    {
        id: 'market',
        name: 'Chandni Chowk Market',
        type: 'caution',
        center: { latitude: 28.6506, longitude: 77.2300 },
        radius: 300,
        isActive: true,
        alertOnEnter: true,
        alertOnExit: false,
    },
];

const ZONE_COLORS = {
    safe: { bg: 'bg-success/20', border: 'border-success', text: 'text-success' },
    caution: { bg: 'bg-warning/20', border: 'border-warning', text: 'text-warning' },
    danger: { bg: 'bg-danger/20', border: 'border-danger', text: 'text-danger' },
    custom: { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary' },
};

export function GeoFenceSystem({ isOpen, onClose, userLocation }: GeoFenceSystemProps) {
    const [zones, setZones] = useState<GeoZone[]>(PRESET_ZONES);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newZone, setNewZone] = useState({
        name: '',
        radius: 200,
        alertOnEnter: true,
        alertOnExit: true,
    });
    const [currentZone, setCurrentZone] = useState<GeoZone | null>(null);

    useEffect(() => {
        // Check if user is in any zone
        if (userLocation) {
            const inZone = zones.find(zone => {
                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    zone.center.latitude,
                    zone.center.longitude
                );
                return distance <= zone.radius;
            });
            setCurrentZone(inZone || null);
        }
    }, [userLocation, zones]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleAddZone = () => {
        if (!newZone.name.trim() || !userLocation) return;

        const zone: GeoZone = {
            id: `zone-${Date.now()}`,
            name: newZone.name,
            type: 'custom',
            center: userLocation,
            radius: newZone.radius,
            isActive: true,
            alertOnEnter: newZone.alertOnEnter,
            alertOnExit: newZone.alertOnExit,
        };

        setZones(prev => [...prev, zone]);
        setNewZone({ name: '', radius: 200, alertOnEnter: true, alertOnExit: true });
        setShowAddModal(false);
    };

    const handleToggleZone = (id: string) => {
        setZones(prev => prev.map(z =>
            z.id === id ? { ...z, isActive: !z.isActive } : z
        ));
    };

    const handleDeleteZone = (id: string) => {
        setZones(prev => prev.filter(z => z.id !== id));
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 bg-background flex flex-col">
                {/* Header */}
                <header className="px-4 py-4 border-b border-border flex items-center gap-3">
                    <button onClick={onClose} className="text-muted-foreground">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-bold">Geo-Fence System</h2>
                        <p className="text-xs text-muted-foreground">Virtual safety boundaries</p>
                    </div>
                    <Button size="sm" onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-1" /> Add Zone
                    </Button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Current Status */}
                    <Card variant="elevated" className={cn(
                        'border-2',
                        currentZone
                            ? ZONE_COLORS[currentZone.type].border
                            : 'border-muted'
                    )}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    'p-3 rounded-xl',
                                    currentZone
                                        ? ZONE_COLORS[currentZone.type].bg
                                        : 'bg-muted'
                                )}>
                                    <MapPin className={cn(
                                        'w-6 h-6',
                                        currentZone
                                            ? ZONE_COLORS[currentZone.type].text
                                            : 'text-muted-foreground'
                                    )} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Current Location Status</h3>
                                    {currentZone ? (
                                        <>
                                            <p className={cn('font-medium', ZONE_COLORS[currentZone.type].text)}>
                                                Inside: {currentZone.name}
                                            </p>
                                            <Badge variant={
                                                currentZone.type === 'safe' ? 'success' :
                                                    currentZone.type === 'caution' ? 'warning' : 'danger'
                                            }>
                                                {currentZone.type.toUpperCase()} ZONE
                                            </Badge>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">Not inside any defined zone</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Map Placeholder */}
                    <Card variant="glass" className="h-48 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <div className="text-center">
                                <Map className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Interactive Map View</p>
                                <p className="text-xs text-muted-foreground">(Map visualization)</p>
                            </div>
                            {/* Simulated zones */}
                            <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full border-2 border-success bg-success/10 flex items-center justify-center">
                                <Circle className="w-4 h-4 text-success" />
                            </div>
                            <div className="absolute bottom-1/4 right-1/3 w-12 h-12 rounded-full border-2 border-warning bg-warning/10 flex items-center justify-center">
                                <Circle className="w-3 h-3 text-warning" />
                            </div>
                        </div>
                    </Card>

                    {/* Zones List */}
                    <div>
                        <h3 className="font-semibold mb-3">My Zones ({zones.length})</h3>
                        <div className="space-y-3">
                            {zones.map((zone) => (
                                <Card
                                    key={zone.id}
                                    variant="glass"
                                    className={cn(
                                        'border-l-4',
                                        zone.isActive
                                            ? ZONE_COLORS[zone.type].border
                                            : 'border-l-muted opacity-60'
                                    )}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                'p-2 rounded-lg',
                                                zone.isActive ? ZONE_COLORS[zone.type].bg : 'bg-muted'
                                            )}>
                                                <Circle className={cn(
                                                    'w-5 h-5',
                                                    zone.isActive ? ZONE_COLORS[zone.type].text : 'text-muted-foreground'
                                                )} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{zone.name}</span>
                                                    <Badge variant={
                                                        zone.type === 'safe' ? 'success' :
                                                            zone.type === 'caution' ? 'warning' :
                                                                zone.type === 'danger' ? 'danger' : 'secondary'
                                                    }>
                                                        {zone.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Radius: {zone.radius}m
                                                </p>
                                                <div className="flex items-center gap-4 text-xs">
                                                    {zone.alertOnEnter && (
                                                        <span className="flex items-center gap-1 text-success">
                                                            <Bell className="w-3 h-3" /> Alert on enter
                                                        </span>
                                                    )}
                                                    {zone.alertOnExit && (
                                                        <span className="flex items-center gap-1 text-warning">
                                                            <AlertTriangle className="w-3 h-3" /> Alert on exit
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleZone(zone.id)}
                                                    className={cn(
                                                        'w-10 h-5 rounded-full transition-colors relative',
                                                        zone.isActive ? 'bg-success' : 'bg-muted'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'w-3 h-3 rounded-full bg-white absolute top-1 transition-transform',
                                                        zone.isActive ? 'translate-x-6' : 'translate-x-1'
                                                    )} />
                                                </button>
                                                {zone.type === 'custom' && (
                                                    <button
                                                        onClick={() => handleDeleteZone(zone.id)}
                                                        className="p-1 text-danger hover:bg-danger/10 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <Card variant="glass" className="border-primary/30">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">Smart Geo-Fencing</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Geo-fences automatically alert your emergency contacts and police
                                        when you enter dangerous zones or unexpectedly leave safe zones.
                                        AI monitors patterns to reduce false alarms.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Zone Modal */}
            <Modal open={showAddModal} onOpenChange={setShowAddModal}>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Create Custom Zone</h2>

                    <div className="space-y-4">
                        <Input
                            label="Zone Name"
                            placeholder="e.g., Tourist Spot, Restaurant"
                            value={newZone.name}
                            onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                        />

                        <div>
                            <label className="text-sm font-medium block mb-2">Radius: {newZone.radius}m</label>
                            <input
                                type="range"
                                min="50"
                                max="1000"
                                step="50"
                                value={newZone.radius}
                                onChange={(e) => setNewZone(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>50m</span>
                                <span>1km</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Alerts</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newZone.alertOnEnter}
                                    onChange={(e) => setNewZone(prev => ({ ...prev, alertOnEnter: e.target.checked }))}
                                    className="rounded"
                                />
                                <span className="text-sm">Alert when entering zone</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newZone.alertOnExit}
                                    onChange={(e) => setNewZone(prev => ({ ...prev, alertOnExit: e.target.checked }))}
                                    className="rounded"
                                />
                                <span className="text-sm">Alert when leaving zone</span>
                            </label>
                        </div>

                        <div className="p-3 bg-background-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Zone will be centered at your current location
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={handleAddZone} disabled={!newZone.name.trim()}>
                                Create Zone
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default GeoFenceSystem;
