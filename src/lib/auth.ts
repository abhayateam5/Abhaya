import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { UserSession, UserRole } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-dev-secret-change-in-prod';
const SESSION_NAME = 'abhaya_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Simple encryption for session data (replace with proper JWT in production)
function encodeSession(data: UserSession): string {
    const json = JSON.stringify(data);
    const encoded = Buffer.from(json).toString('base64');
    // Add a simple signature
    const signature = Buffer.from(SESSION_SECRET + encoded).toString('base64').slice(0, 32);
    return `${encoded}.${signature}`;
}

function decodeSession(token: string): UserSession | null {
    try {
        const [encoded, signature] = token.split('.');
        const expectedSignature = Buffer.from(SESSION_SECRET + encoded).toString('base64').slice(0, 32);

        if (signature !== expectedSignature) {
            return null;
        }

        const json = Buffer.from(encoded, 'base64').toString('utf-8');
        return JSON.parse(json) as UserSession;
    } catch {
        return null;
    }
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Session management
export async function createSession(user: UserSession): Promise<void> {
    const token = encodeSession(user);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
    });
}

export async function getSession(): Promise<UserSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_NAME)?.value;

    if (!token) {
        return null;
    }

    return decodeSession(token);
}

export async function destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_NAME);
}

// Authorization helpers
export async function requireAuth(): Promise<UserSession> {
    const session = await getSession();

    if (!session) {
        throw new Error('Unauthorized');
    }

    return session;
}

export async function requireRole(roles: UserRole[]): Promise<UserSession> {
    const session = await requireAuth();

    if (!roles.includes(session.role)) {
        throw new Error('Forbidden');
    }

    return session;
}

// Generate unique IDs
export function generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate digital ID hash (simplified blockchain-like hash)
export function generateDigitalIdHash(userId: string, timestamp: number): string {
    const data = `${userId}-${timestamp}-${SESSION_SECRET}`;
    const hash = Buffer.from(data).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    return hash.slice(0, 32).toUpperCase();
}

// Generate family join code
export function generateFamilyCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
