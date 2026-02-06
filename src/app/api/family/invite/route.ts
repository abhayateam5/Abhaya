import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/family/invite
 * Generate invite code for family member to join
 */
export async function POST(request: NextRequest) {
    try {
        // Get authenticated client and user in one call
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { expiresIn } = body;

        // Generate random invite code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const expiresAt = new Date(Date.now() + (expiresIn || 86400000)).toISOString();

        // Store invite code with authenticated Supabase client
        // Use NULL for child_id to avoid primary key conflict
        const { data, error } = await supabase
            .from('family_links')
            .insert({
                parent_id: user.id,
                child_id: null, // Will be set when someone joins with the code
                status: 'pending',
                invite_code: code,
                invite_expires_at: expiresAt,
            })
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ code }, { status: 200 });
    } catch (error: any) {
        console.error('Error in POST /api/family/invite:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/family/invite
 * Join family using invite code
 */
export async function PUT(request: NextRequest) {
    try {
        // Get authenticated client and user in one call
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { inviteCode } = body;

        if (!inviteCode) {
            return NextResponse.json(
                { error: 'Missing required field: inviteCode' },
                { status: 400 }
            );
        }

        // Find pending invite
        const { data: link, error: findError } = await supabase
            .from('family_links')
            .select('*')
            .eq('invite_code', inviteCode)
            .eq('status', 'pending')
            .gt('invite_expires_at', new Date().toISOString())
            .single();

        if (findError || !link) {
            return NextResponse.json(
                { error: 'Invalid or expired invite code' },
                { status: 400 }
            );
        }

        // Update link with child
        const { error: updateError } = await supabase
            .from('family_links')
            .update({
                child_id: user.id,
                status: 'active',
                invite_code: null,
                invite_expires_at: null,
            })
            .eq('id', link.id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Error in PUT /api/family/invite:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
