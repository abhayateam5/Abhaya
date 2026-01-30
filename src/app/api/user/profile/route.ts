import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models';
import { getSession } from '@/lib/auth';
import type { ApiResponse } from '@/types';

// GET - Get user profile
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode
            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    _id: session.userId,
                    name: session.name,
                    email: session.email,
                    role: session.role,
                    phone: '+91 9876543210',
                    nationality: 'India',
                    safetyScore: 82,
                    emergencyContacts: [
                        { name: 'Emergency Contact', phone: '+91 1234567890', relationship: 'Family' },
                    ],
                    isVerified: true,
                    createdAt: new Date(),
                },
            });
        }

        const user = await User.findById(session.userId);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const allowedFields = [
            'name',
            'phone',
            'photo',
            'nationality',
            'passportNumber',
            'aadharNumber',
            'emergencyContacts',
        ];

        // Filter to only allowed fields
        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { ...updates, _id: session.userId },
                message: 'Profile updated (mock mode)',
            });
        }

        const user = await User.findByIdAndUpdate(
            session.userId,
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: user,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
