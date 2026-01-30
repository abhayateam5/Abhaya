'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    MapPin,
    Calendar,
    Clock,
    ChevronRight,
    Trash2,
    Edit2,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useAuth } from '@/context';
import { Card, CardContent, Button, Input, Modal, Spinner, Badge } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';

interface Destination {
    id: string;
    name: string;
    address: string;
    location: { latitude: number; longitude: number };
    arrivalDate: string;
    departureDate: string;
    notes?: string;
}

interface Itinerary {
    _id: string;
    title: string;
    destinations: Destination[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
}

export default function ItineraryPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newItinerary, setNewItinerary] = useState({
        title: '',
        destinations: [] as Destination[],
    });
    const [newDestination, setNewDestination] = useState({
        name: '',
        address: '',
        arrivalDate: '',
        departureDate: '',
        notes: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchItineraries();
    }, []);

    const fetchItineraries = async () => {
        try {
            const res = await fetch('/api/itinerary');
            const data = await res.json();
            if (data.success) {
                setItineraries(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch itineraries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addDestination = () => {
        if (!newDestination.name || !newDestination.arrivalDate) return;

        const dest: Destination = {
            id: `dest-${Date.now()}`,
            name: newDestination.name,
            address: newDestination.address || newDestination.name,
            location: { latitude: 28.6139, longitude: 77.2090 }, // Default Delhi
            arrivalDate: newDestination.arrivalDate,
            departureDate: newDestination.departureDate || newDestination.arrivalDate,
            notes: newDestination.notes,
        };

        setNewItinerary(prev => ({
            ...prev,
            destinations: [...prev.destinations, dest],
        }));

        setNewDestination({ name: '', address: '', arrivalDate: '', departureDate: '', notes: '' });
    };

    const removeDestination = (id: string) => {
        setNewItinerary(prev => ({
            ...prev,
            destinations: prev.destinations.filter(d => d.id !== id),
        }));
    };

    const handleCreateItinerary = async () => {
        if (!newItinerary.title || newItinerary.destinations.length === 0) return;

        const dates = newItinerary.destinations.map(d => new Date(d.arrivalDate));
        const endDates = newItinerary.destinations.map(d => new Date(d.departureDate));

        try {
            const res = await fetch('/api/itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newItinerary.title,
                    destinations: newItinerary.destinations,
                    startDate: new Date(Math.min(...dates.map(d => d.getTime()))),
                    endDate: new Date(Math.max(...endDates.map(d => d.getTime()))),
                }),
            });

            const data = await res.json();
            if (data.success) {
                setItineraries(prev => [data.data, ...prev]);
                setShowCreateModal(false);
                setNewItinerary({ title: '', destinations: [] });
            }
        } catch (error) {
            console.error('Failed to create itinerary:', error);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <header className="px-4 py-4 flex items-center gap-4">
                <Link href="/tourist/dashboard" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-semibold flex-1">My Itinerary</h1>
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-1" /> New
                </Button>
            </header>

            <div className="px-4 space-y-4">
                {itineraries.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <p className="text-muted-foreground">No itineraries yet</p>
                        <p className="text-sm text-muted-foreground">Plan your trip to stay safe</p>
                        <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Create Itinerary
                        </Button>
                    </div>
                ) : (
                    itineraries.map((itinerary) => (
                        <Card key={itinerary._id} variant="glass">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{itinerary.title}</h3>
                                            {itinerary.isActive && (
                                                <Badge variant="success">Active</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDate(new Date(itinerary.startDate))} - {formatDate(new Date(itinerary.endDate))}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">{itinerary.destinations.length} stops</Badge>
                                </div>

                                <div className="space-y-2">
                                    {itinerary.destinations.slice(0, 3).map((dest, idx) => (
                                        <div key={dest.id} className="flex items-center gap-3 text-sm">
                                            <div className={cn(
                                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                                                idx === 0 ? 'bg-primary text-white' : 'bg-background-muted'
                                            )}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{dest.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(new Date(dest.arrivalDate))}</p>
                                            </div>
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    ))}
                                    {itinerary.destinations.length > 3 && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            +{itinerary.destinations.length - 3} more destinations
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Create Itinerary</h2>

                    <div className="space-y-4">
                        <Input
                            label="Trip Name"
                            placeholder="e.g., Golden Triangle Tour"
                            value={newItinerary.title}
                            onChange={(e) => setNewItinerary(prev => ({ ...prev, title: e.target.value }))}
                        />

                        <div className="border-t border-border pt-4">
                            <h3 className="font-medium mb-3">Add Destinations</h3>

                            <div className="space-y-3 mb-4">
                                <Input
                                    label="Destination"
                                    placeholder="e.g., Taj Mahal, Agra"
                                    value={newDestination.name}
                                    onChange={(e) => setNewDestination(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        type="date"
                                        label="Arrival"
                                        value={newDestination.arrivalDate}
                                        onChange={(e) => setNewDestination(prev => ({ ...prev, arrivalDate: e.target.value }))}
                                    />
                                    <Input
                                        type="date"
                                        label="Departure"
                                        value={newDestination.departureDate}
                                        onChange={(e) => setNewDestination(prev => ({ ...prev, departureDate: e.target.value }))}
                                    />
                                </div>
                                <Input
                                    label="Notes (optional)"
                                    placeholder="Any special notes..."
                                    value={newDestination.notes}
                                    onChange={(e) => setNewDestination(prev => ({ ...prev, notes: e.target.value }))}
                                />
                                <Button type="button" variant="secondary" className="w-full" onClick={addDestination}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Destination
                                </Button>
                            </div>

                            {/* Added destinations */}
                            {newItinerary.destinations.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    <h4 className="text-sm font-medium">Your Route:</h4>
                                    {newItinerary.destinations.map((dest, idx) => (
                                        <div key={dest.id} className="flex items-center gap-2 p-2 bg-background-muted rounded-lg">
                                            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{dest.name}</p>
                                                <p className="text-xs text-muted-foreground">{dest.arrivalDate}</p>
                                            </div>
                                            <button onClick={() => removeDestination(dest.id)} className="p-1 text-danger hover:bg-danger/10 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleCreateItinerary}
                                disabled={!newItinerary.title || newItinerary.destinations.length === 0}
                            >
                                Create Itinerary
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
