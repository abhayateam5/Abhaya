'use client';

import { useState, useEffect } from 'react';
import {
    Shield,
    X,
    Moon,
    Phone,
    MapPin,
    Clock,
    Bell,
    Users,
    Eye,
    AlertTriangle,
    CheckCircle,
    ChevronRight,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Modal } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FemaleSafetyModeProps {
    isOpen: boolean;
    onClose: () => void;
    isEnabled?: boolean;
    onToggle?: (enabled: boolean) => void;
}

interface SafetyContact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
}

const SAFETY_FEATURES = [
    {
        id: 'live_tracking',
        icon: MapPin,
        title: 'Live Location Sharing',
        description: 'Share real-time location with trusted contacts',
        isActive: true,
    },
    {
        id: 'night_mode',
        icon: Moon,
        title: 'Night Mode Alerts',
        description: 'Extra check-ins between 8 PM - 6 AM',
        isActive: true,
    },
    {
        id: 'shake_sos',
        icon: Shield,
        title: 'Shake to SOS',
        description: 'Shake phone vigorously to trigger SOS',
        isActive: false,
    },
    {
        id: 'fake_call',
        icon: Phone,
        title: 'Fake Call Feature',
        description: 'Simulate incoming call to exit uncomfortable situations',
        isActive: true,
    },
    {
        id: 'silent_alert',
        icon: Bell,
        title: 'Silent Distress',
        description: 'Double-tap volume button to send silent SOS',
        isActive: true,
    },
    {
        id: 'crowd_alert',
        icon: Users,
        title: 'Crowd Density Alerts',
        description: 'Warn when entering low-crowd areas at night',
        isActive: true,
    },
];

export function FemaleSafetyMode({ isOpen, onClose, isEnabled = false, onToggle }: FemaleSafetyModeProps) {
    const [enabled, setEnabled] = useState(isEnabled);
    const [features, setFeatures] = useState(SAFETY_FEATURES);
    const [trustedContacts, setTrustedContacts] = useState<SafetyContact[]>([
        { id: '1', name: 'Mom', phone: '+91 98765 43210', relationship: 'Mother' },
        { id: '2', name: 'Local Police', phone: '100', relationship: 'Emergency' },
    ]);
    const [showFakeCallScheduler, setShowFakeCallScheduler] = useState(false);

    const handleToggleMode = () => {
        const newState = !enabled;
        setEnabled(newState);
        onToggle?.(newState);
    };

    const handleToggleFeature = (featureId: string) => {
        setFeatures(prev => prev.map(f =>
            f.id === featureId ? { ...f, isActive: !f.isActive } : f
        ));
    };

    const triggerFakeCall = () => {
        // Simulate fake incoming call after 5 seconds
        setTimeout(() => {
            alert('📞 Incoming Call: Mom');
        }, 5000);
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
                        Female Safety Mode
                        <Badge variant={enabled ? 'success' : 'secondary'}>
                            {enabled ? 'Active' : 'Inactive'}
                        </Badge>
                    </h2>
                    <p className="text-xs text-muted-foreground">Enhanced safety features for women travelers</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Main Toggle */}
                <Card variant="elevated" className={cn(
                    'border-2 transition-colors',
                    enabled ? 'border-pink-500 bg-pink-500/10' : 'border-border'
                )}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'p-3 rounded-xl',
                                    enabled ? 'bg-pink-500/20' : 'bg-muted'
                                )}>
                                    <Shield className={cn('w-6 h-6', enabled ? 'text-pink-500' : 'text-muted-foreground')} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Safety Mode</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {enabled ? 'All safety features active' : 'Tap to enable safety features'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggleMode}
                                className={cn(
                                    'w-14 h-7 rounded-full transition-colors relative',
                                    enabled ? 'bg-pink-500' : 'bg-muted'
                                )}
                            >
                                <div className={cn(
                                    'w-5 h-5 rounded-full bg-white absolute top-1 transition-transform',
                                    enabled ? 'translate-x-8' : 'translate-x-1'
                                )} />
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                {enabled && (
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="secondary"
                            className="h-auto py-4 flex-col gap-2"
                            onClick={triggerFakeCall}
                        >
                            <Phone className="w-6 h-6 text-pink-500" />
                            <span className="text-sm">Fake Call</span>
                            <span className="text-xs text-muted-foreground">In 5 seconds</span>
                        </Button>
                        <Button
                            variant="secondary"
                            className="h-auto py-4 flex-col gap-2"
                        >
                            <MapPin className="w-6 h-6 text-pink-500" />
                            <span className="text-sm">Share Location</span>
                            <span className="text-xs text-muted-foreground">With contacts</span>
                        </Button>
                    </div>
                )}

                {/* Trusted Contacts */}
                <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" /> Trusted Contacts
                    </h3>
                    <div className="space-y-2">
                        {trustedContacts.map((contact) => (
                            <Card key={contact.id} variant="glass">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 font-bold">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{contact.name}</p>
                                            <p className="text-xs text-muted-foreground">{contact.relationship} • {contact.phone}</p>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-success" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Button variant="secondary" className="w-full">
                            + Add Trusted Contact
                        </Button>
                    </div>
                </div>

                {/* Safety Features */}
                <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Safety Features
                    </h3>
                    <div className="space-y-2">
                        {features.map((feature) => (
                            <Card key={feature.id} variant="glass">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'p-2 rounded-lg',
                                            feature.isActive ? 'bg-pink-500/20' : 'bg-muted'
                                        )}>
                                            <feature.icon className={cn(
                                                'w-5 h-5',
                                                feature.isActive ? 'text-pink-500' : 'text-muted-foreground'
                                            )} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{feature.title}</p>
                                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleFeature(feature.id)}
                                            className={cn(
                                                'w-10 h-5 rounded-full transition-colors relative',
                                                feature.isActive ? 'bg-pink-500' : 'bg-muted'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-3 h-3 rounded-full bg-white absolute top-1 transition-transform',
                                                feature.isActive ? 'translate-x-6' : 'translate-x-1'
                                            )} />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Safety Tips */}
                <Card variant="glass" className="border-pink-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Eye className="w-5 h-5 text-pink-500 mt-0.5" />
                            <div>
                                <p className="font-medium">Safety Tips</p>
                                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                    <li>• Keep your phone charged above 20%</li>
                                    <li>• Share your travel itinerary with family</li>
                                    <li>• Avoid isolated areas after dark</li>
                                    <li>• Keep emergency numbers on speed dial</li>
                                    <li>• Trust your instincts - leave if uncomfortable</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default FemaleSafetyMode;
