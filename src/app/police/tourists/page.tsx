'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Search,
    MapPin,
    Phone,
    Shield,
    Clock,
    ChevronRight,
    User,
    Filter,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Badge, Spinner } from '@/components/ui';
import { cn, getSafetyColor, formatRelativeTime } from '@/lib/utils';

interface Tourist {
    _id: string;
    name: string;
    email: string;
    phone: string;
    nationality: string;
    safetyScore: number;
    isActive: boolean;
    lastActive: Date;
    photo?: string;
}

export default function PoliceTouristsPage() {
    const router = useRouter();
    const [tourists, setTourists] = useState<Tourist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        fetchTourists();
    }, []);

    const fetchTourists = async () => {
        try {
            const res = await fetch('/api/police/tourists');
            const data = await res.json();
            if (data.success) {
                setTourists(data.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tourists:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTourists = tourists.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.email.toLowerCase().includes(search.toLowerCase()) ||
            t.phone.includes(search);
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && t.isActive) ||
            (filter === 'inactive' && !t.isActive);
        return matchesSearch && matchesFilter;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="px-4 py-4 flex items-center gap-4">
                <Link href="/police/dashboard" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-semibold flex-1">Tourist Directory</h1>
                <Badge variant="secondary">{tourists.length} registered</Badge>
            </header>

            {/* Search */}
            <div className="px-4 mb-4">
                <Input
                    placeholder="Search by name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search className="w-5 h-5" />}
                />
            </div>

            {/* Filters */}
            <div className="px-4 mb-4">
                <div className="flex gap-2">
                    {(['all', 'active', 'inactive'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-sm capitalize transition-colors',
                                filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-background-soft hover:bg-background-muted'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 mb-4 grid grid-cols-3 gap-2">
                <Card variant="glass">
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-success">{tourists.filter(t => t.isActive).length}</p>
                        <p className="text-xs text-muted-foreground">Active Now</p>
                    </CardContent>
                </Card>
                <Card variant="glass">
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-primary">{tourists.length}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                    </CardContent>
                </Card>
                <Card variant="glass">
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-warning">{tourists.filter(t => t.safetyScore < 70).length}</p>
                        <p className="text-xs text-muted-foreground">Low Safety</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tourist List */}
            <div className="px-4 space-y-3">
                {filteredTourists.length === 0 ? (
                    <div className="text-center py-12">
                        <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No tourists found</p>
                    </div>
                ) : (
                    filteredTourists.map((tourist) => (
                        <Card key={tourist._id} variant="glass">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
                                        tourist.isActive
                                            ? 'bg-success/20 text-success'
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        {tourist.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{tourist.name}</span>
                                            {tourist.isActive && (
                                                <span className="w-2 h-2 rounded-full bg-success" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{tourist.email}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {tourist.phone}
                                            </span>
                                            <span>{tourist.nationality}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn('flex items-center gap-1 font-bold', getSafetyColor(tourist.safetyScore))}>
                                            <Shield className="w-4 h-4" />
                                            {tourist.safetyScore}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatRelativeTime(new Date(tourist.lastActive))}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                                    <Button size="sm" variant="secondary" className="flex-1">
                                        <MapPin className="w-4 h-4 mr-1" /> Locate
                                    </Button>
                                    <Button size="sm" variant="secondary" className="flex-1">
                                        <Phone className="w-4 h-4 mr-1" /> Contact
                                    </Button>
                                    <Button size="sm" variant="secondary">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
