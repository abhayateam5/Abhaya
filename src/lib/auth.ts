/**
 * ABHAYA Authentication Utilities
 * Supabase Auth integration
 */

import { supabase } from './supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface SignUpParams {
    email: string;
    password: string;
    name?: string;
    phone?: string;
}

export interface SignInParams {
    email: string;
    password: string;
}

export interface AuthResult {
    user: User | null;
    session: Session | null;
    error: AuthError | null;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Sign up new user
 * @param params Signup parameters
 * @returns Auth result
 */
export async function signUp(params: SignUpParams): Promise<AuthResult> {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: params.email,
            password: params.password,
            options: {
                data: {
                    name: params.name,
                    phone: params.phone,
                },
            },
        });

        if (error) {
            console.error('Signup error:', error);
            return { user: null, session: null, error };
        }

        return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
        console.error('Exception during signup:', error);
        return { user: null, session: null, error };
    }
}

/**
 * Sign in existing user
 * @param params Signin parameters
 * @returns Auth result
 */
export async function signIn(params: SignInParams): Promise<AuthResult> {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: params.email,
            password: params.password,
        });

        if (error) {
            console.error('Signin error:', error);
            return { user: null, session: null, error };
        }

        return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
        console.error('Exception during signin:', error);
        return { user: null, session: null, error };
    }
}

/**
 * Sign out current user
 * @returns Error if any
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Signout error:', error);
            return { error };
        }

        return { error: null };
    } catch (error: any) {
        console.error('Exception during signout:', error);
        return { error };
    }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get current authenticated user
 * @returns Current user or null
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Get current session
 * @returns Current session or null
 */
export async function getSession(): Promise<Session | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns True if authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

/**
 * Send password reset email
 * @param email User email
 * @returns Error if any
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            console.error('Password reset error:', error);
            return { error };
        }

        return { error: null };
    } catch (error: any) {
        console.error('Exception during password reset:', error);
        return { error };
    }
}

/**
 * Update user password
 * @param newPassword New password
 * @returns Error if any
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            console.error('Password update error:', error);
            return { error };
        }

        return { error: null };
    } catch (error: any) {
        console.error('Exception during password update:', error);
        return { error };
    }
}

// ============================================================================
// AUTH STATE LISTENERS
// ============================================================================

/**
 * Subscribe to auth state changes
 * @param callback Callback function
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
    callback: (event: string, session: Session | null) => void
): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);

    return () => {
        subscription.unsubscribe();
    };
}

// ============================================================================
// PHONE OTP (Optional - for future use)
// ============================================================================

/**
 * Send OTP to phone number
 * @param phone Phone number
 * @returns Error if any
 */
export async function sendPhoneOTP(phone: string): Promise<{ error: AuthError | null }> {
    try {
        const { error } = await supabase.auth.signInWithOtp({
            phone,
        });

        if (error) {
            console.error('Phone OTP error:', error);
            return { error };
        }

        return { error: null };
    } catch (error: any) {
        console.error('Exception sending phone OTP:', error);
        return { error };
    }
}

/**
 * Verify phone OTP
 * @param phone Phone number
 * @param token OTP token
 * @returns Auth result
 */
export async function verifyPhoneOTP(phone: string, token: string): Promise<AuthResult> {
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        });

        if (error) {
            console.error('Phone OTP verification error:', error);
            return { user: null, session: null, error };
        }

        return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
        console.error('Exception verifying phone OTP:', error);
        return { user: null, session: null, error };
    }
}
