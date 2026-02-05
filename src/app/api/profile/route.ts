import { NextRequest, NextResponse } from 'next/server';
import {
    getCurrentProfile,
    createProfile,
    updateProfile,
    type CreateProfileParams,
    type UpdateProfileParams,
} from '@/lib/profile';

/**
 * GET /api/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
    try {
        const { data, error } = await getCurrentProfile();

        if (error) {
            return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/profile
 * Create user profile (onboarding)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.email || !body.phone || !body.role) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, phone, role' },
                { status: 400 }
            );
        }

        const params: CreateProfileParams = {
            name: body.name,
            email: body.email,
            phone: body.phone,
            role: body.role,
            emergency_contacts: body.emergency_contacts || [],
            nationality: body.nationality,
            passport_number: body.passport_number,
            aadhar_number: body.aadhar_number,
            photo: body.photo,
        };

        const { data, error } = await createProfile(params);

        if (error) {
            return NextResponse.json({ error: error.message || 'Failed to create profile' }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/profile
 * Update user profile
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Get current user
        const { data: profile, error: profileError } = await getCurrentProfile();
        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const params: UpdateProfileParams = {
            name: body.name,
            phone: body.phone,
            photo: body.photo,
            nationality: body.nationality,
            passport_number: body.passport_number,
            aadhar_number: body.aadhar_number,
            emergency_contacts: body.emergency_contacts,
            badge_number: body.badge_number,
            department: body.department,
            rank: body.rank,
            jurisdiction: body.jurisdiction,
        };

        // Remove undefined fields
        Object.keys(params).forEach((key) => {
            if (params[key as keyof UpdateProfileParams] === undefined) {
                delete params[key as keyof UpdateProfileParams];
            }
        });

        const { data, error } = await updateProfile(profile.id, params);

        if (error) {
            return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        console.error('Error in PUT /api/profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
