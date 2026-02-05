'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole, EmergencyContact } from '@/lib/profile';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '' as UserRole,
        nationality: '',
        passport_number: '',
        aadhar_number: '',
        emergency_contacts: [] as EmergencyContact[],
        photo: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalSteps = 5;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create profile');
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addEmergencyContact = () => {
        setFormData({
            ...formData,
            emergency_contacts: [
                ...formData.emergency_contacts,
                { name: '', phone: '', relationship: '', is_primary: formData.emergency_contacts.length === 0 },
            ],
        });
    };

    const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: any) => {
        const updated = [...formData.emergency_contacts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, emergency_contacts: updated });
    };

    const removeEmergencyContact = (index: number) => {
        const updated = formData.emergency_contacts.filter((_, i) => i !== index);
        setFormData({ ...formData, emergency_contacts: updated });
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.name && formData.email && formData.phone;
            case 2:
                return formData.role;
            case 3:
                return formData.emergency_contacts.length >= 2;
            case 4:
                return formData.role === 'police' ? formData.aadhar_number : formData.nationality;
            case 5:
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Step {step} of {totalSteps}</span>
                        <span className="text-sm font-medium text-indigo-600">{Math.round((step / totalSteps) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome to ABHAYA</h2>
                        <p className="text-gray-600">Let's set up your profile</p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="+91 1234567890"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Role Selection */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Select Your Role</h2>
                        <p className="text-gray-600">Choose the role that best describes you</p>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { value: 'parent', label: 'Parent/Guardian', desc: 'Monitor family members' },
                                { value: 'child', label: 'Tourist/Traveler', desc: 'Share location with family' },
                                { value: 'police', label: 'Police Officer', desc: 'Respond to SOS alerts' },
                                { value: 'admin', label: 'Administrator', desc: 'System management' },
                            ].map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => setFormData({ ...formData, role: role.value as UserRole })}
                                    className={`p-4 border-2 rounded-lg text-left transition-all ${formData.role === role.value
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">{role.label}</div>
                                    <div className="text-sm text-gray-600 mt-1">{role.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Emergency Contacts */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
                        <p className="text-gray-600">Add at least 2 emergency contacts</p>

                        {formData.emergency_contacts.map((contact, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Contact {index + 1}</span>
                                    {formData.emergency_contacts.length > 1 && (
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
                                    placeholder="Relationship (e.g., Parent, Friend)"
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
                        ))}

                        <button
                            onClick={addEmergencyContact}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                        >
                            + Add Contact
                        </button>
                    </div>
                )}

                {/* Step 4: Documents */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Identity Documents</h2>
                        <p className="text-gray-600">Provide your identification details</p>

                        {formData.role !== 'police' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
                                <input
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., Indian"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {formData.role === 'police' ? 'Aadhar Number *' : 'Passport Number (Optional)'}
                            </label>
                            <input
                                type="text"
                                value={formData.role === 'police' ? formData.aadhar_number : formData.passport_number}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        [formData.role === 'police' ? 'aadhar_number' : 'passport_number']: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder={formData.role === 'police' ? 'XXXX-XXXX-XXXX' : 'A1234567'}
                            />
                        </div>

                        {formData.role !== 'police' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.aadhar_number}
                                    onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="XXXX-XXXX-XXXX"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Step 5: Profile Photo */}
                {step === 5 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Profile Photo</h2>
                        <p className="text-gray-600">Add a profile photo (optional)</p>

                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                                {formData.photo ? (
                                    <img src={formData.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-gray-400">👤</span>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, photo: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="text-sm text-gray-600"
                            />
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Back
                    </button>

                    {step < totalSteps ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !canProceed()}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Profile...' : 'Complete'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
