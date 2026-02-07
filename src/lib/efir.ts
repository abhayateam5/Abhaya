/**
 * e-FIR Service
 * Handles FIR number generation, hash calculation, and validation
 */

/**
 * Generate FIR number format: FIR/YYYY/MM/XXXXX
 */
export function generateFIRNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');

    return `FIR/${year}/${month}/${sequence}`;
}

/**
 * Generate SHA-256 hash for tamper-proof verification
 */
export async function generateHash(data: string): Promise<string> {
    // Use Web Crypto API for SHA-256
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Calculate tamper-proof hash for e-FIR
 */
export async function calculateEFIRHash(data: {
    firNumber: string;
    complainantName: string;
    incidentDate: string;
    incidentDescription: string;
}): Promise<string> {
    const concatenated = `${data.firNumber}|${data.complainantName}|${data.incidentDate}|${data.incidentDescription}`;
    return await generateHash(concatenated);
}

/**
 * Validate e-FIR data
 */
export function validateEFIR(data: {
    complainant_name?: string;
    complainant_phone?: string;
    incident_date?: string;
    incident_address?: string;
    incident_description?: string;
    incident_type?: string;
}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.complainant_name || data.complainant_name.trim().length < 2) {
        errors.push('Complainant name is required (minimum 2 characters)');
    }

    if (!data.complainant_phone || !/^\+?[\d\s-]{10,}$/.test(data.complainant_phone)) {
        errors.push('Valid phone number is required');
    }

    if (!data.incident_date) {
        errors.push('Incident date is required');
    }

    if (!data.incident_address || data.incident_address.trim().length < 5) {
        errors.push('Incident address is required (minimum 5 characters)');
    }

    if (!data.incident_description || data.incident_description.trim().length < 20) {
        errors.push('Incident description is required (minimum 20 characters)');
    }

    if (!data.incident_type) {
        errors.push('Incident type is required');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Format incident types for dropdown
 */
export const INCIDENT_TYPES = [
    { value: 'assault', label: 'Assault / Physical Violence' },
    { value: 'theft', label: 'Theft / Robbery' },
    { value: 'harassment', label: 'Harassment / Stalking' },
    { value: 'fraud', label: 'Fraud / Scam' },
    { value: 'missing_person', label: 'Missing Person' },
    { value: 'accident', label: 'Accident' },
    { value: 'other', label: 'Other' },
];

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
    switch (status) {
        case 'draft': return 'bg-gray-100 text-gray-800';
        case 'submitted': return 'bg-blue-100 text-blue-800';
        case 'under_review': return 'bg-yellow-100 text-yellow-800';
        case 'registered': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-purple-100 text-purple-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}
