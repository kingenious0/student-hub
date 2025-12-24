import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
        }

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                id: true,
                email: true,
                role: true,
                vendorStatus: true,
                shopName: true
            }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If user is a vendor with PENDING status, approve them
        if (currentUser.role === 'VENDOR' && currentUser.vendorStatus === 'PENDING') {
            await prisma.user.update({
                where: { clerkId: userId },
                data: { vendorStatus: 'ACTIVE' }
            });

            return NextResponse.json({
                success: true,
                message: `✅ Approved vendor: ${currentUser.shopName}`,
                before: currentUser.vendorStatus,
                after: 'ACTIVE'
            });
        }

        // User is already active or not a vendor
        return NextResponse.json({
            success: true,
            message: currentUser.role === 'VENDOR'
                ? `Already active: ${currentUser.shopName}`
                : 'Not a vendor account',
            currentStatus: {
                role: currentUser.role,
                vendorStatus: currentUser.vendorStatus,
                shopName: currentUser.shopName
            }
        });

    } catch (error) {
        console.error('Failed to check/approve vendor:', error);
        return NextResponse.json({
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
