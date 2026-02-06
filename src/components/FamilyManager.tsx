'use client';

import { useState } from 'react';
import { UserPlus, Mail, Key, Heart, Trash2, Clock } from 'lucide-react';

interface FamilyManagerProps {
    onInviteGenerated?: (code: string) => void;
    onCheckIn?: () => void;
    onPanicWordSet?: () => void;
}

export default function FamilyManager({
    onInviteGenerated,
    onCheckIn,
    onPanicWordSet,
}: FamilyManagerProps) {
    const [inviteCode, setInviteCode] = useState<string>('');
    const [panicWord, setPanicWord] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [checkInMessage, setCheckInMessage] = useState('');

    const handleGenerateInvite = async () => {
        setLoading(true);
        try {
            console.log('Generating invite code...');
            const response = await fetch('/api/family/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expiresIn: 86400000 }), // 24 hours
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.code) {
                setInviteCode(data.code);
                if (onInviteGenerated) onInviteGenerated(data.code);
                alert('Invite code generated!');
            } else if (data.error) {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to generate invite:', error);
            alert('Failed to generate invite code. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetPanicWord = async () => {
        setLoading(true);
        try {
            console.log('Setting panic word...');
            const response = await fetch('/api/family/panic-word', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: panicWord }),
            });

            console.log('Panic word response status:', response.status);
            const data = await response.json();
            console.log('Panic word response:', data);

            if (response.ok) {
                alert('Panic word set successfully!');
                setPanicWord('');
                if (onPanicWordSet) onPanicWordSet();
            } else {
                alert(`Error: ${data.error || 'Failed to set panic word'}`);
            }
        } catch (error) {
            console.error('Failed to set panic word:', error);
            alert('Failed to set panic word. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendCheckIn = async () => {
        setLoading(true);
        try {
            console.log('Sending check-in...');
            const response = await fetch('/api/family/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: checkInMessage }),
            });

            console.log('Check-in response status:', response.status);
            const data = await response.json();
            console.log('Check-in response:', data);

            if (response.ok) {
                alert('Check-in sent to family!');
                setCheckInMessage('');
                if (onCheckIn) onCheckIn();
            } else {
                alert(`Error: ${data.error || 'Failed to send check-in'}`);
            }
        } catch (error) {
            console.error('Failed to send check-in:', error);
            alert('Failed to send check-in. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Generate Invite Code */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">Add Family Member</h3>
                </div>

                <p className="text-gray-600 mb-4">
                    Generate an invite code for a family member to join your safety network.
                </p>

                <button
                    onClick={handleGenerateInvite}
                    disabled={loading}
                    className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate Invite Code
                </button>

                {inviteCode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-semibold">Invite Code:</p>
                                <p className="text-2xl font-mono font-bold text-blue-900">{inviteCode}</p>
                                <p className="text-xs text-blue-600 mt-1">Expires in 24 hours</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined' && navigator.clipboard) {
                                        navigator.clipboard.writeText(inviteCode);
                                        alert('Code copied to clipboard!');
                                    }
                                }}
                                className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Panic Word Setup */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Key className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-semibold">Panic Word</h3>
                </div>

                <p className="text-gray-600 mb-4">
                    Set a secret word that triggers a silent SOS when detected in messages.
                </p>

                <div className="space-y-3">
                    <input
                        type="password"
                        value={panicWord}
                        onChange={(e) => setPanicWord(e.target.value)}
                        placeholder="Enter panic word (min 3 characters)"
                        className="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                    />

                    <button
                        onClick={handleSetPanicWord}
                        disabled={loading || !panicWord || panicWord.length < 3}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Set Panic Word
                    </button>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800">
                            ⚠️ <strong>Security Tip:</strong> Choose a word you don't normally use.
                            When you use this word in any message, a silent SOS will be triggered
                            without alerting others.
                        </p>
                    </div>
                </div>
            </div>

            {/* I'm Safe Check-in */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-semibold">"I'm Safe" Check-in</h3>
                </div>

                <p className="text-gray-600 mb-4">
                    Send a quick check-in to let your family know you're safe.
                </p>

                <div className="space-y-3">
                    <input
                        type="text"
                        value={checkInMessage}
                        onChange={(e) => setCheckInMessage(e.target.value)}
                        placeholder="Optional message (e.g., 'Arrived safely')"
                        className="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />

                    <button
                        onClick={handleSendCheckIn}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send Check-in
                    </button>
                </div>
            </div>

            {/* Consent Management Info */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Tracking Consent</h4>
                </div>
                <p className="text-sm text-gray-600">
                    Family tracking consent is time-limited (default: 24 hours) and requires periodic renewal
                    for privacy. During SOS events, emergency override automatically grants access.
                </p>
            </div>
        </div>
    );
}
