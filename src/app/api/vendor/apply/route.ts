import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { shopName, shopDescription, location, phoneNumber } = body;

        // Validate required fields
        if (!shopName || !shopDescription || !location || !phoneNumber) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Get internal user ID from Clerk ID
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, appliedForVendor: true }
        });

        if (!dbUser) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Check if user already has a pending or approved application
        const existingApplication = await prisma.vendorApplication.findUnique({
            where: { userId: dbUser.id },
        });

        if (existingApplication) {
            if (existingApplication.status === 'PENDING') {
                return NextResponse.json({
                    error: 'You already have a pending application. Please wait for admin review.'
                }, { status: 400 });
            }
            if (existingApplication.status === 'APPROVED') {
                return NextResponse.json({
                    error: 'You are already a vendor!'
                }, { status: 400 });
            }
        }

        // Check if shop name is already taken
        const nameTaken = await prisma.user.findFirst({
            where: {
                shopName: { equals: shopName, mode: 'insensitive' },
            }
        });

        if (nameTaken) {
            return NextResponse.json({
                error: 'Shop name is already taken. Please choose a unique name.'
            }, { status: 409 });
        }

        // Create vendor application
        const application = await prisma.vendorApplication.upsert({
            where: { userId: dbUser.id },
            update: {
                shopName,
                shopDesc: shopDescription,
                location: { location, phoneNumber }, // Store as JSON
                status: 'APPROVED',
            },
            create: {
                userId: dbUser.id,
                shopName,
                shopDesc: shopDescription,
                location: { location, phoneNumber }, // Store as JSON
                status: 'APPROVED',
            }
        });

        // Update user to mark they've applied AND UPGRADE ROLE
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                appliedForVendor: true,
                role: 'VENDOR',
                vendorStatus: 'ACTIVE'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Application approved! Welcome to the marketplace.',
            application
        });

    } catch (error) {
        console.error('Vendor application error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
