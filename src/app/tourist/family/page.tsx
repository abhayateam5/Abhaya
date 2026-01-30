'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Users,
    Plus,
    Copy,
    UserPlus,
    MapPin,
    Phone,
    Shield,
    Check,
} from 'lucide-react';
import { useAuth } from '@/context';
import { Card, CardContent, Button, Input, Badge, Spinner } from '@/components/ui';
import { cn, getSafetyColor } from '@/lib/utils';

interface FamilyGroup {
    _id: string;
    name: string;
    code: string;
    members: FamilyMember[];
}

interface FamilyMember {
    userId: string;
    name: string;
    phone: string;
    role: string;
    isOnline: boolean;
    safetyScore?: number;
    lastLocation?: {
        latitude: number;
        longitude: number;
        timestamp: Date;
    };
}

export default function FamilyPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [groups, setGroups] = useState<FamilyGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/family');
            const data = await res.json();
            if (data.success) {
                setGroups(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            const res = await fetch('/api/family', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', name: newGroupName }),
            });
            const data = await res.json();
            if (data.success) {
                setGroups([...groups, data.data]);
                setNewGroupName('');
                setShowCreate(false);
            }
        } catch (error) {
            console.error('Create failed:', error);
        }
    };

    const handleJoinGroup = async () => {
        if (!joinCode.trim()) return;
        try {
            const res = await fetch('/api/family', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'join', code: joinCode }),
            });
            const data = await res.json();
            if (data.success) {
                setGroups([...groups, data.data]);
                setJoinCode('');
                setShowJoin(false);
            }
        } catch (error) {
            console.error('Join failed:', error);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
            {/* Header */}
            <header className="px-4 py-4 flex items-center gap-4">
                <Link href="/tourist/dashboard" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-semibold">Family Tracking</h1>
            </header>

            {/* Actions */}
            <div className="px-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => setShowCreate(true)} variant="secondary">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
                    </Button>
                    <Button onClick={() => setShowJoin(true)} variant="secondary">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Group
                    </Button>
                </div>
            </div>

            {/* Create Group Form */}
            {showCreate && (
                <div className="px-4 mb-6">
                    <Card variant="glass">
                        <CardContent className="p-4 space-y-3">
                            <Input
                                label="Group Name"
                                placeholder="e.g., My Family"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleCreateGroup} className="flex-1">Create</Button>
                                <Button onClick={() => setShowCreate(false)} variant="ghost">Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Join Group Form */}
            {showJoin && (
                <div className="px-4 mb-6">
                    <Card variant="glass">
                        <CardContent className="p-4 space-y-3">
                            <Input
                                label="Group Code"
                                placeholder="Enter 6-character code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleJoinGroup} className="flex-1">Join</Button>
                                <Button onClick={() => setShowJoin(false)} variant="ghost">Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Groups */}
            <div className="px-4">
                {groups.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <p className="text-muted-foreground">No family groups yet</p>
                        <p className="text-sm text-muted-foreground">Create or join a group to start tracking</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group) => (
                            <Card key={group._id} variant="glass">
                                <CardContent className="p-4">
                                    {/* Group Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold">{group.name}</h3>
                                            <p className="text-xs text-muted-foreground">{group.members.length} members</p>
                                        </div>
                                        <button
                                            onClick={() => copyCode(group.code)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-background-muted rounded-lg text-sm"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                                            {group.code}
                                        </button>
                                    </div>

                                    {/* Members */}
                                    <div className="space-y-3">
                                        {group.members.map((member) => (
                                            <div key={member.userId} className="flex items-center gap-3 p-2 rounded-lg bg-background-muted/50">
                                                <div className={cn(
                                                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                                                    member.isOnline ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                                                )}>
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium truncate">{member.name}</span>
                                                        {member.role === 'admin' && (
                                                            <Badge variant="secondary" className="text-xs">Admin</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className={cn('flex items-center gap-1', member.isOnline ? 'text-success' : '')}>
                                                            <span className={cn('w-2 h-2 rounded-full', member.isOnline ? 'bg-success' : 'bg-muted')} />
                                                            {member.isOnline ? 'Online' : 'Offline'}
                                                        </span>
                                                        {member.safetyScore && (
                                                            <span className={cn('flex items-center gap-1', getSafetyColor(member.safetyScore))}>
                                                                <Shield className="w-3 h-3" />
                                                                {member.safetyScore}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {member.lastLocation && (
                                                    <button className="p-2 text-primary hover:bg-primary/10 rounded">
                                                        <MapPin className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
