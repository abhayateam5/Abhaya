import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedServerClient } from '@/lib/auth';

/**
 * POST /api/family/panic-word
 * Set panic word for silent SOS
 */
export async function POST(request: NextRequest) {
    try {
        // Get authenticated client and user in one call
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { word } = body;

        if (!word || word.trim().length < 3) {
            return NextResponse.json(
                { error: 'Panic word must be at least 3 characters' },
                { status: 400 }
            );
        }

        // Import bcrypt dynamically
        const bcrypt = await import('bcryptjs');

        // Encrypt the word
        const salt = await bcrypt.genSalt(10);
        const encryptedWord = await bcrypt.hash(word.toLowerCase().trim(), salt);

        // Deactivate old panic words
        await supabase
            .from('panic_words')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true);

        // Insert new panic word
        const { error } = await supabase.from('panic_words').insert({
            user_id: user.id,
            encrypted_word: encryptedWord,
            is_active: true,
        });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Error in POST /api/family/panic-word:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/family/panic-word/check
 * Check if word matches panic word (triggers silent SOS if match)
 */
export async function PUT(request: NextRequest) {
    try {
        // Get authenticated client and user in one call
        const { supabase, user } = await getAuthenticatedServerClient();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { word } = body;

        if (!word) {
            return NextResponse.json(
                { error: 'Missing required field: word' },
                { status: 400 }
            );
        }

        // Import bcrypt dynamically
        const bcrypt = await import('bcryptjs');

        // Get active panic word
        const { data, error } = await supabase
            .from('panic_words')
            .select('encrypted_word')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return NextResponse.json({ isMatch: false }, { status: 200 });
        }

        // Compare words
        const isMatch = await bcrypt.compare(word.toLowerCase().trim(), data.encrypted_word);

        // If match, trigger silent SOS
        if (isMatch) {
            // Create silent SOS event
            await fetch('/api/sos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'silent',
                    trigger_method: 'panic_word',
                    severity: 'critical',
                }),
            });
        }

        return NextResponse.json({ isMatch }, { status: 200 });
    } catch (error: any) {
        console.error('Error in PUT /api/family/panic-word/check:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
