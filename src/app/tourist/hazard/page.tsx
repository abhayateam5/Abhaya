'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    AlertTriangle,
    MapPin,
    Camera,
    Send,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
} from 'lucide-react';
import { useAuth, useLocation } from '@/context';
import { Card, CardContent, Button, Input, Textarea, Select, Badge, Modal, Spinner } from '@/components/ui';
import { cn, formatRelativeTime } from '@/lib/utils';

interface HazardReport {
    id: string;
    type: string;
    description: string;
    location: { latitude: number; longitude: number };
    address: string;
    status: 'pending' | 'verified' | 'resolved' | 'rejected';
    createdAt: Date;
    photo?: string;
}

const HAZARD_TYPES = [
    { value: 'road', label: 'Road Hazard' },
    { value: 'construction', label: 'Construction Zone' },
    { value: 'crime', label: 'Suspicious Activity' },
    { value: 'scam', label: 'Tourist Scam' },
    { value: 'health', label: 'Health Risk Area' },
    { value: 'weather', label: 'Weather Hazard' },
    { value: 'other', label: 'Other' },
];

export default function HazardPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { position } = useLocation();
    const [reports, setReports] = useState<HazardReport[]>([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'road',
        description: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        // Load mock reports
        setReports([
            {
                id: '1',
                type: 'scam',
                description: 'Fake tour guides approaching tourists near entrance',
                location: { latitude: 27.1751, longitude: 78.0421 },
                address: 'Taj Mahal, Agra',
                status: 'verified',
                createdAt: new Date(Date.now() - 3600000),
            },
            {
                id: '2',
                type: 'road',
                description: 'Large pothole on main tourist path',
                location: { latitude: 28.6129, longitude: 77.2295 },
                address: 'Near India Gate',
                status: 'pending',
                createdAt: new Date(Date.now() - 7200000),
            },
        ]);
    }, []);

    const handleSubmit = async () => {
        if (!formData.description.trim()) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newReport: HazardReport = {
            id: `report-${Date.now()}`,
            type: formData.type,
            description: formData.description,
            location: position || { latitude: 28.6139, longitude: 77.2090 },
            address: 'Current Location',
            status: 'pending',
            createdAt: new Date(),
        };

        setReports(prev => [newReport, ...prev]);
        setFormData({ type: 'road', description: '' });
        setShowReportModal(false);
        setIsSubmitting(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <Badge variant="success">Verified</Badge>;
            case 'resolved':
                return <Badge variant="secondary">Resolved</Badge>;
            case 'rejected':
                return <Badge variant="danger">Rejected</Badge>;
            default:
                return <Badge variant="warning">Pending</Badge>;
        }
    };

    const getTypeLabel = (type: string) => {
        return HAZARD_TYPES.find(t => t.value === type)?.label || type;
    };

    if (authLoading) {
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
                <h1 className="text-lg font-semibold flex-1">Hazard Reports</h1>
                <Button size="sm" onClick={() => setShowReportModal(true)}>
                    <AlertTriangle className="w-4 h-4 mr-1" /> Report
                </Button>
            </header>

            {/* Info Banner */}
            <div className="px-4 mb-4">
                <Card variant="glass" className="border-warning/30">
                    <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Help Keep Tourists Safe</p>
                                <p className="text-xs text-muted-foreground">
                                    Report hazards, scams, or unsafe areas to alert other tourists and authorities.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reports List */}
            <div className="px-4 space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">Recent Reports</h2>

                {reports.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <p className="text-muted-foreground">No hazard reports yet</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id} variant="glass">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        'p-2 rounded-lg',
                                        report.status === 'verified' ? 'bg-danger/20' : 'bg-warning/20'
                                    )}>
                                        <AlertTriangle className={cn(
                                            'w-5 h-5',
                                            report.status === 'verified' ? 'text-danger' : 'text-warning'
                                        )} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{getTypeLabel(report.type)}</span>
                                            {getStatusBadge(report.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {report.address}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatRelativeTime(report.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Report Modal */}
            <Modal open={showReportModal} onOpenChange={setShowReportModal}>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Report a Hazard</h2>

                    <div className="space-y-4">
                        <Select
                            label="Hazard Type"
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            options={HAZARD_TYPES}
                        />

                        <Textarea
                            label="Description"
                            placeholder="Describe the hazard in detail..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                        />

                        {position && (
                            <div className="p-3 bg-background-muted rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>Using your current location</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                                </p>
                            </div>
                        )}

                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => {/* Photo capture would go here */ }}
                        >
                            <Camera className="w-4 h-4 mr-2" /> Add Photo (Optional)
                        </Button>

                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="secondary" className="flex-1" onClick={() => setShowReportModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                disabled={!formData.description.trim()}
                            >
                                <Send className="w-4 h-4 mr-2" /> Submit Report
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
