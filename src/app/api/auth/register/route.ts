import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models';
import { hashPassword, createSession, generateDigitalIdHash } from '@/lib/auth';
import type { RegisterData, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: RegisterData = await request.json();
        const { name, email, phone, password, role, nationality, passportNumber } = body;

        // Validate required fields
        if (!name || !email || !phone || !password) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Connect to database
        const db = await connectToDatabase();

        if (!db) {
            // Mock mode - return success without DB
            const mockUser = {
                _id: `mock-${Date.now()}`,
                name,
                email,
                phone,
                role: role || 'tourist',
                safetyScore: 75,
                isActive: true,
                isVerified: false,
                createdAt: new Date(),
            };

            await createSession({
                userId: mockUser._id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
            });

            return NextResponse.json<ApiResponse>({
                success: true,
                data: mockUser,
                message: 'Registration successful (mock mode)',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate digital ID hash
        const digitalIdHash = generateDigitalIdHash(email, Date.now());

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: role || 'tourist',
            nationality,
            passportNumber,
            digitalIdHash,
            safetyScore: 75,
            isActive: true,
            isVerified: false,
        });

        // Create session
        await createSession({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        });

        // Return user data (without password)
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            safetyScore: user.safetyScore,
            digitalIdHash: user.digitalIdHash,
            createdAt: user.createdAt,
        };

        return NextResponse.json<ApiResponse>({
            success: true,
            data: userData,
            message: 'Registration successful',
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
