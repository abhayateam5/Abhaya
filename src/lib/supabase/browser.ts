import { createBrowserClient as createClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient {
    if (client) return client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            'Missing Supabase environment variables. Please check your .env file.'
        );
    }

    client = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });

    return client;
}

// Simple getter function - no Proxy, no module-level initialization
export function getSupabase(): SupabaseClient {
    return createBrowserClient();
}

// For backward compatibility
export const supabase = createBrowserClient();
