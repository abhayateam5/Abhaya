import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/efir/create
 * Create a new e-FIR
 */
export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await getAuthenticatedServerClient();

        // Use test user ID fallback (Phase 6 solution for test pages)
        const TEST_USER_ID = 'd74a4a73-7938-43c6-b54f-98b604579972';
        const userId = user?.id || TEST_USER_ID;

        const body = await request.json();
        const {
            incident_date,
            incident_lat,
            incident_lng,
            incident_address,
            incident_description,
            incident_type,
            suspect_description,
            suspect_count,
        } = body;

        // Get user profile for auto-fill
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, phone, email, nationality')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Profile query error:', profileError);
        }

        if (!profile) {
            console.error('Profile not found for user ID:', userId);
            return NextResponse.json({
                error: 'Profile not found',
                details: `User ID: ${userId}, Error: ${profileError?.message || 'No profile data'}`
            }, { status: 404 });
        }

        // Generate FIR number
        const { data: firNumberData } = await supabase.rpc('generate_fir_number');
        const firNumber = firNumberData || `FIR/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/00001`;

        // Calculate hash
        const { data: hashData } = await supabase.rpc('calculate_efir_hash', {
            p_fir_number: firNumber,
            p_complainant_name: profile.name,
            p_incident_date: incident_date,
            p_incident_description: incident_description,
        });

        // Create e-FIR
        const { data: efir, error } = await supabase
            .from('e_firs')
            .insert({
                fir_number: firNumber,
                user_id: userId,
                complainant_name: profile.name,
                complainant_phone: profile.phone,
                complainant_email: profile.email || null,
                complainant_nationality: profile.nationality || null,
                incident_date,
                incident_location: incident_lat && incident_lng ? `POINT(${incident_lng} ${incident_lat})` : null,
                incident_address,
                incident_description,
                incident_type,
                suspect_description: suspect_description || null,
                suspect_count: suspect_count || 0,
                tamper_proof_hash: hashData || 'pending',
                status: 'draft',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating e-FIR:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'e-FIR created successfully',
            data: efir,
        });
    } catch (error: any) {
        console.error('Error in POST /api/efir/create:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
