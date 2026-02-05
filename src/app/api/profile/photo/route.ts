import { NextRequest, NextResponse } from 'next/server';
import { uploadProfilePhoto, updateProfile, getCurrentProfile } from '@/lib/profile';

/**
 * POST /api/profile/photo
 * Upload profile photo to Supabase Storage
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('photo') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        // Get current user
        const { data: profile, error: profileError } = await getCurrentProfile();
        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Upload photo
        const { url, error: uploadError } = await uploadProfilePhoto(profile.id, file);

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message || 'Failed to upload photo' }, { status: 500 });
        }

        // Update profile with photo URL
        const { data: updatedProfile, error: updateError } = await updateProfile(profile.id, { photo: url! });

        if (updateError) {
            return NextResponse.json({ error: updateError.message || 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ url, profile: updatedProfile }, { status: 200 });
    } catch (error: any) {
        console.error('Error in POST /api/profile/photo:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
