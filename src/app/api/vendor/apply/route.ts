import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { shopName, shopDesc, location } = body;

        if (!shopName || !shopDesc || !location) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
        }

        // Check for existing user
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { application: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (user.role === 'VENDOR') {
            return NextResponse.json({ error: 'Already a Vendor' }, { status: 400 });
        }

        if (user.application) {
            return NextResponse.json({ error: 'Application already pending' }, { status: 400 });
        }

        const application = await prisma.vendorApplication.create({
            data: {
                userId: user.id,
                shopName,
                shopDesc,
                location // Expecting { lat, lng, address }
            }
        });

        return NextResponse.json({ success: true, application });

    } catch (error) {
        console.error('Vendor Application Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
