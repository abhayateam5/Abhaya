import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/location/family
 * Get all family members' locations
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's family links
        const { data: familyLinks, error: familyError } = await supabase
            .from('family_links')
            .select('family_member_id')
            .eq('user_id', user.id)
            .eq('status', 'active');

        if (familyError) {
            console.error('Error fetching family links:', familyError);
            return NextResponse.json({ error: familyError.message }, { status: 500 });
        }

        if (!familyLinks || familyLinks.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }

        const familyMemberIds = familyLinks.map((link) => link.family_member_id);

        // Get locations for all family members
        const { data: locations, error: locationsError } = await supabase
            .from('live_locations')
            .select(
                `
        *,
        profiles:user_id (
          id,
          name,
          photo,
          role
        )
      `
            )
            .in('user_id', familyMemberIds)
            .eq('is_active', true);

        if (locationsError) {
            console.error('Error fetching family locations:', locationsError);
            return NextResponse.json({ error: locationsError.message }, { status: 500 });
        }

        return NextResponse.json({ data: locations }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/location/family:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
