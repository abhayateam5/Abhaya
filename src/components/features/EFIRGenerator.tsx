'use client';

import { useState } from 'react';
import {
    FileText,
    X,
    Upload,
    Camera,
    MapPin,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    Send,
} from 'lucide-react';
import { Button, Input, Textarea, Select, Modal, Badge, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

interface EFIRGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: { latitude: number; longitude: number };
    userName?: string;
    userPhone?: string;
}

const INCIDENT_TYPES = [
    { value: 'theft', label: 'Theft / Pickpocketing' },
    { value: 'fraud', label: 'Fraud / Scam' },
    { value: 'assault', label: 'Physical Assault' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'lost_documents', label: 'Lost Documents' },
    { value: 'property_damage', label: 'Property Damage' },
    { value: 'accident', label: 'Accident' },
    { value: 'other', label: 'Other' },
];

export function EFIRGenerator({ isOpen, onClose, userLocation, userName, userPhone }: EFIRGeneratorProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [firNumber, setFirNumber] = useState('');

    const [formData, setFormData] = useState({
        incidentType: 'theft',
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: new Date().toTimeString().slice(0, 5),
        location: userLocation ? `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}` : '',
        locationDescription: '',
        description: '',
        witnessInfo: '',
        valueLost: '',
        suspectDescription: '',
        photos: [] as string[],
    });

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate FIR number
        const firNum = `EFIR-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        setFirNumber(firNum);
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const handleReset = () => {
        setStep(1);
        setIsSubmitted(false);
        setFirNumber('');
        setFormData({
            incidentType: 'theft',
            incidentDate: new Date().toISOString().split('T')[0],
            incidentTime: new Date().toTimeString().slice(0, 5),
            location: '',
            locationDescription: '',
            description: '',
            witnessInfo: '',
            valueLost: '',
            suspectDescription: '',
            photos: [],
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal open={isOpen} onOpenChange={onClose}>
            <div className="p-6 max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-danger/20">
                        <FileText className="w-6 h-6 text-danger" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">e-FIR Generator</h2>
                        <p className="text-sm text-muted-foreground">File an online First Information Report</p>
                    </div>
                </div>

                {isSubmitted ? (
                    /* Success State */
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">e-FIR Submitted Successfully</h3>
                        <p className="text-muted-foreground mb-6">
                            Your complaint has been registered with the local authorities.
                        </p>

                        <Card variant="glass" className="mb-6">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground mb-1">Your FIR Number</p>
                                <p className="text-2xl font-mono font-bold text-primary">{firNumber}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Save this number for future reference
                                </p>
                            </CardContent>
                        </Card>

                        <div className="text-left space-y-3 mb-6">
                            <div className="flex items-start gap-3 p-3 bg-background-muted rounded-lg">
                                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                                <div>
                                    <p className="font-medium">Confirmation sent to your email</p>
                                    <p className="text-sm text-muted-foreground">A copy has been sent to your registered email</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-background-muted rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                                <div>
                                    <p className="font-medium">Next Steps</p>
                                    <p className="text-sm text-muted-foreground">
                                        Visit the police station within 3 days with your ID to complete the process
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full" onClick={handleReset}>
                            Close
                        </Button>
                    </div>
                ) : (
                    /* Form Steps */
                    <>
                        {/* Progress */}
                        <div className="flex items-center gap-2 mb-6">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex-1 flex items-center">
                                    <div className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                                        step >= s ? 'bg-primary text-white' : 'bg-background-muted'
                                    )}>
                                        {s}
                                    </div>
                                    {s < 3 && (
                                        <div className={cn(
                                            'flex-1 h-1 mx-2',
                                            step > s ? 'bg-primary' : 'bg-background-muted'
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Incident Details */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Incident Details</h3>

                                <Select
                                    label="Type of Incident"
                                    value={formData.incidentType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, incidentType: e.target.value }))}
                                    options={INCIDENT_TYPES}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        type="date"
                                        label="Date of Incident"
                                        value={formData.incidentDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, incidentDate: e.target.value }))}
                                        icon={<Calendar className="w-5 h-5" />}
                                    />
                                    <Input
                                        type="time"
                                        label="Time of Incident"
                                        value={formData.incidentTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, incidentTime: e.target.value }))}
                                        icon={<Clock className="w-5 h-5" />}
                                    />
                                </div>

                                <Input
                                    label="Location (GPS Coordinates)"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    icon={<MapPin className="w-5 h-5" />}
                                    placeholder="Auto-filled from GPS"
                                />

                                <Input
                                    label="Location Description"
                                    value={formData.locationDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, locationDescription: e.target.value }))}
                                    placeholder="e.g., Near India Gate, Main entrance"
                                />
                            </div>
                        )}

                        {/* Step 2: Description */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Incident Description</h3>

                                <Textarea
                                    label="Describe what happened"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Provide a detailed account of the incident..."
                                    rows={5}
                                />

                                {(formData.incidentType === 'theft' || formData.incidentType === 'fraud') && (
                                    <Input
                                        label="Estimated Value Lost (₹)"
                                        value={formData.valueLost}
                                        onChange={(e) => setFormData(prev => ({ ...prev, valueLost: e.target.value }))}
                                        placeholder="e.g., 5000"
                                        type="number"
                                    />
                                )}

                                <Textarea
                                    label="Suspect Description (if any)"
                                    value={formData.suspectDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, suspectDescription: e.target.value }))}
                                    placeholder="Physical features, clothing, vehicle, etc."
                                    rows={3}
                                />

                                <Input
                                    label="Witness Information (optional)"
                                    value={formData.witnessInfo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, witnessInfo: e.target.value }))}
                                    placeholder="Names or contact details of witnesses"
                                />
                            </div>
                        )}

                        {/* Step 3: Evidence & Review */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Evidence & Review</h3>

                                <div className="p-4 border-2 border-dashed border-border rounded-xl text-center">
                                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">Upload photos or documents</p>
                                    <Button variant="secondary" size="sm" className="mt-2">
                                        <Camera className="w-4 h-4 mr-2" /> Add Photos
                                    </Button>
                                </div>

                                <Card variant="glass">
                                    <CardContent className="p-4">
                                        <h4 className="font-medium mb-3">Summary</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Incident Type</span>
                                                <span className="font-medium">
                                                    {INCIDENT_TYPES.find(t => t.value === formData.incidentType)?.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Date & Time</span>
                                                <span className="font-medium">{formData.incidentDate} {formData.incidentTime}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Complainant</span>
                                                <span className="font-medium">{userName || 'Tourist User'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium text-warning">Important</p>
                                            <p className="text-muted-foreground">
                                                Filing a false report is a punishable offense. Ensure all information is accurate.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                            {step > 1 && (
                                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                                    Back
                                </Button>
                            )}
                            <Button variant="secondary" className="flex-1" onClick={onClose}>
                                Cancel
                            </Button>
                            {step < 3 ? (
                                <Button className="flex-1" onClick={() => setStep(step + 1)}>
                                    Continue
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1"
                                    onClick={handleSubmit}
                                    isLoading={isSubmitting}
                                >
                                    <Send className="w-4 h-4 mr-2" /> Submit e-FIR
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}

export default EFIRGenerator;
