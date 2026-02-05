'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Profile, EmergencyContact } from '@/lib/profile';

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<Partial<Profile>>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            setProfile(data.data);
            setFormData(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update profile');
            }

            const data = await response.json();
            setProfile(data.data);
            setEditing(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const addEmergencyContact = () => {
        const contacts = formData.emergency_contacts || [];
        setFormData({
            ...formData,
            emergency_contacts: [
                ...contacts,
                { name: '', phone: '', relationship: '', is_primary: contacts.length === 0 },
            ],
        });
    };

    const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: any) => {
        const contacts = [...(formData.emergency_contacts || [])];
        contacts[index] = { ...contacts[index], [field]: value };
        setFormData({ ...formData, emergency_contacts: contacts });
    };

    const removeEmergencyContact = (index: number) => {
        const contacts = (formData.emergency_contacts || []).filter((_, i) => i !== index);
        setFormData({ ...formData, emergency_contacts: contacts });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Profile not found</p>
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Complete Onboarding
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                                {profile.photo ? (
                                    <img src={profile.photo} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-3xl">👤</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                                <p className="text-gray-600">{profile.email}</p>
                                <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => (editing ? handleSave() : setEditing(true))}
                            disabled={saving}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            {editing ? (
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.nationality || ''}
                                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900">{profile.nationality || 'Not provided'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Safety Score</label>
                            <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${profile.safety_score}%` }}
                                    />
                                </div>
                                <span className="text-gray-900 font-medium">{profile.safety_score}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Emergency Contacts</h2>
                        {editing && (
                            <button
                                onClick={addEmergencyContact}
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                                + Add Contact
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {(editing ? formData.emergency_contacts : profile.emergency_contacts)?.map((contact, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                {editing ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-900">Contact {index + 1}</span>
                                            {(formData.emergency_contacts?.length || 0) > 2 && (
                                                <button
                                                    onClick={() => removeEmergencyContact(index)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            value={contact.name}
                                            onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                                            placeholder="Name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />

                                        <input
                                            type="tel"
                                            value={contact.phone}
                                            onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                                            placeholder="Phone"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />

                                        <input
                                            type="text"
                                            value={contact.relationship}
                                            onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                                            placeholder="Relationship"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={contact.is_primary}
                                                onChange={(e) => updateEmergencyContact(index, 'is_primary', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">Primary contact</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{contact.name}</span>
                                            {contact.is_primary && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm">{contact.phone}</p>
                                        <p className="text-gray-500 text-sm">{contact.relationship}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cancel Button (when editing) */}
                {editing && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setEditing(false);
                                setFormData(profile);
                                setError('');
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
