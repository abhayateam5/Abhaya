import { createBrowserClient as createClient } from '@supabase/ssr';

let client: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
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

// Export a singleton instance for convenience
export const supabase = createBrowserClient();
