'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Home,
    Shield,
    CreditCard,
    User,
    Users,
    Heart,
    Wifi,
    AlertTriangle,
    Map,
    Cloud,
    BookOpen,
    Bot,
    Bell,
    MapPin,
    Gift,
    FileText,
    Eye,
    Globe,
    Calendar,
} from 'lucide-react';
import { useAuth, useLocation, useSafety, useSOS } from '@/context';
import { Button, Badge, Spinner, Card, CardContent } from '@/components/ui';
import {
    DrishtiAI,
    EFIRGenerator,
    SafetyRewards,
    FemaleSafetyMode,
    AnomalyDetection,
    GeoFenceSystem
} from '@/components/features';
import { cn, getSafetyColor, getSafetyLabel } from '@/lib/utils';

export default function TouristDashboard() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { position, isTracking, startTracking } = useLocation();
    const { score, level, refreshScore } = useSafety();
    const { isActive: sosActive, isCountingDown, countdown, triggerSOS, cancelSOS } = useSOS();

    const [activeTab, setActiveTab] = useState('map');

    // Feature modals state
    const [showDrishti, setShowDrishti] = useState(false);
    const [showEFIR, setShowEFIR] = useState(false);
    const [showRewards, setShowRewards] = useState(false);
    const [showFemaleSafety, setShowFemaleSafety] = useState(false);
    const [showAnomalyDetection, setShowAnomalyDetection] = useState(false);
    const [showGeoFence, setShowGeoFence] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        startTracking();
        refreshScore();
    }, []);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const quickActions = [
        { id: 'family', label: 'Family', icon: Users, href: '/tourist/family', color: 'text-primary' },
        { id: 'health', label: 'Health', icon: Heart, href: '/tourist/health', color: 'text-danger' },
        { id: 'rfid', label: 'RFID', icon: Wifi, href: '/tourist/digital-id', color: 'text-success' },
        { id: 'hazard', label: 'Hazard', icon: AlertTriangle, href: '/tourist/hazard', color: 'text-warning' },
    ];

    const advancedFeatures = [
        { id: 'ai', label: 'Drishti AI', icon: Bot, color: 'from-purple-500 to-pink-500', onClick: () => setShowDrishti(true) },
        { id: 'efir', label: 'e-FIR', icon: FileText, color: 'from-red-500 to-orange-500', onClick: () => setShowEFIR(true) },
        { id: 'rewards', label: 'Rewards', icon: Gift, color: 'from-yellow-500 to-amber-500', onClick: () => setShowRewards(true) },
        { id: 'female', label: 'Women Safety', icon: Shield, color: 'from-pink-500 to-rose-500', onClick: () => setShowFemaleSafety(true) },
        { id: 'anomaly', label: 'Anomaly', icon: Eye, color: 'from-blue-500 to-cyan-500', onClick: () => setShowAnomalyDetection(true) },
        { id: 'geofence', label: 'Geo-Fence', icon: Globe, color: 'from-green-500 to-emerald-500', onClick: () => setShowGeoFence(true) },
    ];

    const moreLinks = [
        { id: 'itinerary', label: 'My Itinerary', icon: Calendar, href: '/tourist/itinerary' },
        { id: 'profile', label: 'Profile', icon: User, href: '/tourist/profile' },
    ];

    const tabs = [
        { id: 'map', label: 'Map', icon: Map },
        { id: 'weather', label: 'Weather', icon: Cloud },
        { id: 'guides', label: 'Guides', icon: BookOpen },
    ];

    const navItems = [
        { href: '/tourist/dashboard', label: 'Home', icon: Home, active: true },
        { href: '/tourist/safety-score', label: 'Safety', icon: Shield },
        { href: '/tourist/digital-id', label: 'ID', icon: CreditCard },
        { href: '/tourist/profile', label: 'Profile', icon: User },
    ];

    return (
        <>
            <div className="min-h-screen flex flex-col pb-20">
                {/* Header */}
                <header className="px-4 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-sm">Welcome back,</p>
                        <h1 className="text-xl font-bold">{user?.name || 'Tourist'}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAnomalyDetection(true)}
                            className="p-2 rounded-lg bg-background-soft hover:bg-background-muted transition-colors relative"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                        </button>
                        <Link href="/tourist/profile">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0) || 'T'}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Safety Score Banner */}
                <div className="px-4 mb-4">
                    <Link href="/tourist/safety-score">
                        <div className="glass-card p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', getSafetyColor(score))}>
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Safety Score</p>
                                    <div className="flex items-center gap-2">
                                        <span className={cn('text-2xl font-bold', getSafetyColor(score))}>{score}</span>
                                        <Badge variant={level === 'excellent' || level === 'good' ? 'success' : level === 'moderate' ? 'warning' : 'danger'}>
                                            {getSafetyLabel(score)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            {position && (
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        Live tracking
                                    </p>
                                    <p className="text-xs text-success">Active</p>
                                </div>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Tabs */}
                <div className="px-4 mb-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn('tab-item flex items-center gap-2 whitespace-nowrap', activeTab === tab.id && 'active')}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="px-4 mb-4">
                    <div className="glass-card h-48 flex items-center justify-center relative overflow-hidden">
                        {activeTab === 'map' && (
                            <div className="text-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                                <Map className="w-12 h-12 mx-auto text-muted-foreground mb-2 relative z-10" />
                                <p className="text-muted-foreground relative z-10">Interactive Map</p>
                                <p className="text-xs text-muted-foreground mt-1 relative z-10">
                                    {position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : 'Getting location...'}
                                </p>
                            </div>
                        )}
                        {activeTab === 'weather' && (
                            <div className="text-center">
                                <Cloud className="w-12 h-12 mx-auto text-primary mb-2" />
                                <p className="text-2xl font-bold">28°C</p>
                                <p className="text-muted-foreground">Partly Cloudy</p>
                                <p className="text-xs text-muted-foreground mt-1">New Delhi, India</p>
                            </div>
                        )}
                        {activeTab === 'guides' && (
                            <div className="text-center">
                                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">Local Guides & Tips</p>
                                <Button size="sm" variant="secondary" className="mt-2">
                                    Explore Guides
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {quickActions.map((action) => (
                            <Link key={action.id} href={action.href}>
                                <div className="quick-action">
                                    <action.icon className={cn('w-6 h-6 mb-2', action.color)} />
                                    <span className="text-xs">{action.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Advanced Features */}
                <div className="px-4 mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Premium Features</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {advancedFeatures.map((feature) => (
                            <button
                                key={feature.id}
                                onClick={feature.onClick}
                                className="p-3 rounded-xl bg-background-soft border border-border hover:border-primary/50 transition-all"
                            >
                                <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2 mx-auto', feature.color)}>
                                    <feature.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs block text-center">{feature.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* More Links */}
                <div className="px-4 mb-4">
                    <div className="flex gap-2">
                        {moreLinks.map((link) => (
                            <Link key={link.id} href={link.href} className="flex-1">
                                <Card variant="glass">
                                    <CardContent className="p-3 flex items-center gap-2">
                                        <link.icon className="w-4 h-4 text-primary" />
                                        <span className="text-sm">{link.label}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* SOS Button */}
                <div className="px-4 mb-6">
                    {isCountingDown ? (
                        <div className="text-center">
                            <button
                                onClick={cancelSOS}
                                className="sos-button active w-full py-4 text-xl"
                            >
                                CANCEL ({countdown})
                            </button>
                            <p className="text-sm text-muted-foreground mt-2">Tap to cancel SOS</p>
                        </div>
                    ) : sosActive ? (
                        <div className="text-center">
                            <div className="sos-button active w-full py-4 text-xl">
                                SOS ACTIVE - HELP IS ON THE WAY
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => triggerSOS('sos')}
                            className="sos-button w-full py-4 text-xl"
                        >
                            🆘 SOS EMERGENCY
                        </button>
                    )}
                </div>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 bg-background-soft border-t border-border px-4 py-2">
                    <div className="flex justify-around">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div className={cn('nav-item', item.active && 'active')}>
                                    <item.icon className="w-5 h-5 mb-1" />
                                    <span className="text-xs">{item.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Feature Modals */}
            <DrishtiAI
                isOpen={showDrishti}
                onClose={() => setShowDrishti(false)}
                userLocation={position || undefined}
            />
            <EFIRGenerator
                isOpen={showEFIR}
                onClose={() => setShowEFIR(false)}
                userLocation={position || undefined}
                userName={user?.name}
            />
            <SafetyRewards
                isOpen={showRewards}
                onClose={() => setShowRewards(false)}
                safetyScore={score}
            />
            <FemaleSafetyMode
                isOpen={showFemaleSafety}
                onClose={() => setShowFemaleSafety(false)}
            />
            <AnomalyDetection
                isOpen={showAnomalyDetection}
                onClose={() => setShowAnomalyDetection(false)}
                userLocation={position || undefined}
            />
            <GeoFenceSystem
                isOpen={showGeoFence}
                onClose={() => setShowGeoFence(false)}
                userLocation={position || undefined}
            />
        </>
    );
}
