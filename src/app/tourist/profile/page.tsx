'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Globe,
    Shield,
    Camera,
    Save,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/context';
import { Card, CardContent, Button, Input, Spinner } from '@/components/ui';
import { cn, getSafetyColor } from '@/lib/utils';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    passportNumber?: string;
    emergencyContacts: Array<{ name: string; phone: string; relationship: string }>;
    safetyScore: number;
    isVerified: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading: authLoading, logout } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        nationality: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
                setFormData({
                    name: data.data.name,
                    phone: data.data.phone,
                    nationality: data.data.nationality,
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                fetchProfile();
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
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
                <h1 className="text-lg font-semibold">Profile</h1>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                    {isEditing ? <Save className="w-4 h-4" /> : 'Edit'}
                </Button>
            </header>

            {/* Profile Card */}
            <div className="px-4 mb-6">
                <Card variant="elevated" className="overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary to-secondary" />
                    <CardContent className="pt-0">
                        <div className="-mt-12 mb-4">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 rounded-full bg-background border-4 border-background flex items-center justify-center text-3xl font-bold text-primary">
                                    {profile?.name?.charAt(0) || 'T'}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold">{profile?.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                {profile?.email}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <div className={cn('flex items-center gap-1 text-sm', getSafetyColor(profile?.safetyScore || 0))}>
                                    <Shield className="w-4 h-4" />
                                    Safety Score: {profile?.safetyScore}
                                </div>
                                {profile?.isVerified && (
                                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Details */}
            <div className="px-4 space-y-4">
                <Card variant="glass">
                    <CardContent className="p-4 space-y-4">
                        <h3 className="font-semibold">Personal Information</h3>

                        {isEditing ? (
                            <>
                                <Input
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    icon={<User className="w-5 h-5" />}
                                />
                                <Input
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    icon={<Phone className="w-5 h-5" />}
                                />
                                <Input
                                    label="Nationality"
                                    value={formData.nationality}
                                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    icon={<Globe className="w-5 h-5" />}
                                />
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-background-muted rounded-lg">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="font-medium">{profile?.phone || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-background-muted rounded-lg">
                                    <Globe className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nationality</p>
                                        <p className="font-medium">{profile?.nationality || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Emergency Contacts */}
                <Card variant="glass">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">Emergency Contacts</h3>
                        {profile?.emergencyContacts && profile.emergencyContacts.length > 0 ? (
                            <div className="space-y-2">
                                {profile.emergencyContacts.map((contact, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-background-muted rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center text-danger font-medium">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{contact.name}</p>
                                            <p className="text-xs text-muted-foreground">{contact.relationship} • {contact.phone}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No emergency contacts added</p>
                        )}
                        <Button variant="secondary" size="sm" className="mt-3 w-full">
                            Add Emergency Contact
                        </Button>
                    </CardContent>
                </Card>

                {/* Logout */}
                <Button variant="danger" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
