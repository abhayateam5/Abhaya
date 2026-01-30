import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { FamilyGroup } from '@/models';
import { getSession, generateFamilyCode } from '@/lib/auth';
import type { ApiResponse } from '@/types';

// GET - Get user's family groups
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
                data: [
                    {
                        _id: 'mock-family-1',
                        name: 'My Family',
                        code: 'ABC123',
                        members: [
                            {
                                userId: session.userId,
                                name: session.name,
                                phone: '+91 9876543210',
                                role: 'admin',
                                isOnline: true,
                                safetyScore: 85,
                                lastLocation: {
                                    latitude: 28.6139,
                                    longitude: 77.2090,
                                    timestamp: new Date(),
                                },
                            },
                            {
                                userId: 'mock-member-2',
                                name: 'Family Member',
                                phone: '+91 8765432109',
                                role: 'member',
                                isOnline: true,
                                safetyScore: 78,
                                lastLocation: {
                                    latitude: 28.6200,
                                    longitude: 77.2150,
                                    timestamp: new Date(Date.now() - 300000),
                                },
                            },
                        ],
                        createdBy: session.userId,
                        createdAt: new Date(),
                    },
                ],
            });
        }

        const groups = await FamilyGroup.find({
            'members.userId': session.userId,
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: groups,
        });
    } catch (error) {
        console.error('Family groups fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new family group or join existing
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, name, code } = body;

        const db = await connectToDatabase();

        if (action === 'create') {
            if (!name) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Group name is required' },
                    { status: 400 }
                );
            }

            const groupCode = generateFamilyCode();

            if (!db) {
                // Mock mode
                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: {
                        _id: `mock-family-${Date.now()}`,
                        name,
                        code: groupCode,
                        members: [
                            {
                                userId: session.userId,
                                name: session.name,
                                phone: '+91 9876543210',
                                role: 'admin',
                                isOnline: true,
                            },
                        ],
                        createdBy: session.userId,
                        createdAt: new Date(),
                    },
                    message: 'Family group created (mock mode)',
                });
            }

            const group = await FamilyGroup.create({
                name,
                code: groupCode,
                members: [
                    {
                        userId: session.userId,
                        name: session.name,
                        phone: '+91 9876543210',
                        role: 'admin',
                        isOnline: true,
                    },
                ],
                createdBy: session.userId,
            });

            return NextResponse.json<ApiResponse>({
                success: true,
                data: group,
                message: 'Family group created successfully',
            });
        }

        if (action === 'join') {
            if (!code) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Group code is required' },
                    { status: 400 }
                );
            }

            if (!db) {
                // Mock mode
                return NextResponse.json<ApiResponse>({
                    success: true,
                    data: {
                        _id: 'mock-joined-group',
                        name: 'Joined Family',
                        code: code.toUpperCase(),
                    },
                    message: 'Joined group (mock mode)',
                });
            }

            const group = await FamilyGroup.findOne({ code: code.toUpperCase() });
            if (!group) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Invalid group code' },
                    { status: 404 }
                );
            }

            // Check if already a member
            const isMember = group.members.some((m) => m.userId === session.userId);
            if (isMember) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Already a member of this group' },
                    { status: 400 }
                );
            }

            // Add as member
            group.members.push({
                userId: session.userId,
                name: session.name,
                phone: '+91 9876543210',
                role: 'member',
                isOnline: true,
            });
            await group.save();

            return NextResponse.json<ApiResponse>({
                success: true,
                data: group,
                message: 'Joined family group successfully',
            });
        }

        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Family group operation error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
