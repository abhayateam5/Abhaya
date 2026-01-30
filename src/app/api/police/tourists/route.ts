import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models';
import { getSession } from '@/lib/auth';
import type { ApiResponse, PaginatedResponse, User as UserType } from '@/types';

// GET - Get all tourists (police only)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'police') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        const db = await connectToDatabase();

        if (!db) {
            // Mock mode - return sample tourists
            const mockTourists = generateMockTourists(10);
            return NextResponse.json<ApiResponse<PaginatedResponse<Partial<UserType>>>>({
                success: true,
                data: {
                    data: mockTourists,
                    total: mockTourists.length,
                    page: 1,
                    limit: 20,
                    totalPages: 1,
                },
            });
        }

        const query: Record<string, unknown> = { role: 'tourist' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { passportNumber: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(query);
        const tourists = await User.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ lastActive: -1 })
            .lean();

        return NextResponse.json<ApiResponse<PaginatedResponse<Partial<UserType>>>>({
            success: true,
            data: {
                data: tourists as unknown as Partial<UserType>[],
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Tourists fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Generate mock tourists for demo
function generateMockTourists(count: number): Partial<UserType>[] {
    const nationalities = ['USA', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'Canada'];
    const names = [
        'John Smith', 'Emma Wilson', 'Hans Mueller', 'Sophie Martin',
        'James Brown', 'Yuki Tanaka', 'Michael Johnson', 'Anna Schmidt',
        'David Lee', 'Sarah Connor'
    ];

    return Array.from({ length: count }, (_, i) => ({
        _id: `mock-tourist-${i}`,
        name: names[i % names.length],
        email: `tourist${i}@example.com`,
        phone: `+91 98765432${i.toString().padStart(2, '0')}`,
        role: 'tourist' as const,
        nationality: nationalities[i % nationalities.length],
        safetyScore: 60 + Math.floor(Math.random() * 35),
        isActive: Math.random() > 0.2,
        isVerified: true,
        lastActive: new Date(Date.now() - Math.random() * 3600000),
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30),
    }));
}
