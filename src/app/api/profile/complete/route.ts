import { NextRequest, NextResponse } from 'next/server';
import { getCurrentProfile, isProfileComplete, getMissingFields, getProfileCompletionPercentage } from '@/lib/profile';

/**
 * GET /api/profile/complete
 * Check if current user's profile is complete
 * Returns: { complete: boolean, missing_fields: string[], completion_percentage: number }
 */
export async function GET(request: NextRequest) {
    try {
        const { data: profile, error } = await getCurrentProfile();

        if (error) {
            return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
        }

        if (!profile) {
            return NextResponse.json(
                {
                    complete: false,
                    missing_fields: ['Profile not created'],
                    completion_percentage: 0,
                },
                { status: 200 }
            );
        }

        const complete = isProfileComplete(profile);
        const missing_fields = getMissingFields(profile);
        const completion_percentage = getProfileCompletionPercentage(profile);

        return NextResponse.json(
            {
                complete,
                missing_fields,
                completion_percentage,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error in GET /api/profile/complete:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
