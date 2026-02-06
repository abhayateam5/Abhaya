import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth';
import {
    createFamilyLink,
    getFamilyMembers,
    updateTrackingConsent,
    revokeFamilyLink,
} from '@/lib/family';

/**
 * GET /api/family
 * Get all family members for the current user
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserServer(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await getFamilyMembers(user.id);

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/family:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/family
 * Create a new family link
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserServer(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { childId, relationshipType, consentDuration, notes } = body;

        if (!childId) {
            return NextResponse.json(
                { error: 'Missing required field: childId' },
                { status: 400 }
            );
        }

        const { data, error } = await createFamilyLink(user.id, childId, {
            relationshipType,
            consentDuration,
            notes,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/family:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/family
 * Update tracking consent
 */
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUserServer(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { childId, consentUntil } = body;

        if (!childId || !consentUntil) {
            return NextResponse.json(
                { error: 'Missing required fields: childId, consentUntil' },
                { status: 400 }
            );
        }

        const { success, error } = await updateTrackingConsent(
            user.id,
            childId,
            new Date(consentUntil)
        );

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ success }, { status: 200 });
    } catch (error: any) {
        console.error('Error in PUT /api/family:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/family
 * Revoke family link
 */
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUserServer(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const childId = searchParams.get('childId');

        if (!childId) {
            return NextResponse.json(
                { error: 'Missing required parameter: childId' },
                { status: 400 }
            );
        }

        const { success, error } = await revokeFamilyLink(user.id, childId);

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ success }, { status: 200 });
    } catch (error: any) {
        console.error('Error in DELETE /api/family:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
