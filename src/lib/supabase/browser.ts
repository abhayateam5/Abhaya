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

// Lazy-loaded singleton - only initializes when accessed
let _supabase: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
    get(target, prop) {
        if (!_supabase) {
            _supabase = createBrowserClient();
        }
        return (_supabase as any)[prop];
    }
});

