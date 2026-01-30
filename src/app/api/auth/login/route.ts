import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models';
import { verifyPassword, createSession } from '@/lib/auth';
import type { LoginCredentials, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: LoginCredentials = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Connect to database
        const db = await connectToDatabase();

        if (!db) {
            // Mock mode - accept demo credentials
            if (email === 'demo@abhaya.app' || email === 'police@abhaya.app') {
                const role = email === 'police@abhaya.app' ? 'police' : 'tourist';
                const mockUser = {
                    _id: `mock-${role}-user`,
                    name: role === 'police' ? 'Officer Demo' : 'Demo Tourist',
                    email,
                    role,
                    safetyScore: 82,
                };

                await createSession({
                    userId: mockUser._id,
                    email: mockUser.email,
                    name: mockUser.name,
                    role: mockUser.role as 'tourist' | 'police',
                });

                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: mockUser,
                    message: 'Login successful (mock mode)',
                });
            }

            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid credentials (use demo@abhaya.app for demo)' },
                { status: 401 }
            );
        }

        // Find user with password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Update last active
        user.lastActive = new Date();
        await user.save();

        // Create session
        await createSession({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            photo: user.photo,
        });

        // Return user data
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            photo: user.photo,
            safetyScore: user.safetyScore,
            lastActive: user.lastActive,
        };

        return NextResponse.json<ApiResponse>({
            success: true,
            data: userData,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
