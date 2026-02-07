'use client';

import { useState, useEffect } from 'react';
import { INCIDENT_TYPES } from '@/lib/efir';

export default function EFIRForm({ onSuccess }: { onSuccess?: () => void }) {
    const [formData, setFormData] = useState({
        incident_date: '',
        incident_address: '',
        incident_description: '',
        incident_type: '',
        suspect_description: '',
        suspect_count: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Get current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const response = await fetch('/api/efir/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...formData,
                            incident_lat: position.coords.latitude,
                            incident_lng: position.coords.longitude,
                        }),
                    });

                    const data = await response.json();

                    if (data.success) {
                        alert(`✅ e-FIR created!\nFIR Number: ${data.data.fir_number}`);
                        setFormData({
                            incident_date: '',
                            incident_address: '',
                            incident_description: '',
                            incident_type: '',
                            suspect_description: '',
                            suspect_count: 0,
                        });
                        onSuccess?.();
                    } else {
                        alert('Error: ' + data.error);
                    }
                    setIsSubmitting(false);
                }, () => {
                    alert('Location access denied. Please enable location.');
                    setIsSubmitting(false);
                });
            }
        } catch (error) {
            console.error('Error creating e-FIR:', error);
            alert('Failed to create e-FIR');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Create e-FIR</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Incident Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incident Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.incident_date}
                        onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Incident Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incident Type *
                    </label>
                    <select
                        value={formData.incident_type}
                        onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select incident type</option>
                        {INCIDENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Incident Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incident Address *
                    </label>
                    <input
                        type="text"
                        value={formData.incident_address}
                        onChange={(e) => setFormData({ ...formData, incident_address: e.target.value })}
                        placeholder="Enter incident location"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Incident Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incident Description * (minimum 20 characters)
                    </label>
                    <textarea
                        value={formData.incident_description}
                        onChange={(e) => setFormData({ ...formData, incident_description: e.target.value })}
                        placeholder="Describe what happened in detail..."
                        required
                        minLength={20}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Suspect Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suspect Description (optional)
                    </label>
                    <textarea
                        value={formData.suspect_description}
                        onChange={(e) => setFormData({ ...formData, suspect_description: e.target.value })}
                        placeholder="Physical description, clothing, etc."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Suspect Count */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Suspects
                    </label>
                    <input
                        type="number"
                        value={formData.suspect_count}
                        onChange={(e) => setFormData({ ...formData, suspect_count: parseInt(e.target.value) || 0 })}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${isSubmitting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isSubmitting ? 'Creating e-FIR...' : '📝 Create e-FIR'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                    Your profile details will be auto-filled. Location permission required.
                </p>
            </form>
        </div>
    );
}
