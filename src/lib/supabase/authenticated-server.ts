import { createServerClient as createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get authenticated Supabase client for API routes
 * This client has the user's auth session and will work with RLS policies
 */
export async function getAuthenticatedSupabaseServer(): Promise<SupabaseClient> {
    const cookieStore = cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            'Missing Supabase environment variables. Please check your .env file.'
        );
    }

    return createClient(supabaseUrl, supabaseKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
                try {
                    cookieStore.set({ name, value, ...options });
                } catch (error) {
                    // Handle cookie setting errors in Server Components
                }
            },
            remove(name: string, options: any) {
                try {
                    cookieStore.set({ name, value: '', ...options });
                } catch (error) {
                    // Handle cookie removal errors in Server Components
                }
            },
        },
    });
}
