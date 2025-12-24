import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find all vendors with PENDING status
        const pendingVendors = await prisma.user.findMany({
            where: {
                role: 'VENDOR',
                vendorStatus: 'PENDING'
            },
            select: {
                id: true,
                email: true,
                name: true,
                shopName: true,
                vendorStatus: true
            }
        });

        if (pendingVendors.length === 0) {
            // Check current user's status
            const currentUser = await prisma.user.findUnique({
                where: { clerkId: userId },
                select: {
                    email: true,
                    role: true,
                    vendorStatus: true,
                    shopName: true
                }
            });

            return NextResponse.json({
                success: true,
                message: 'No pending vendors found',
                currentUser
            });
        }

        // Auto-approve all pending vendors
        const result = await prisma.user.updateMany({
            where: {
                role: 'VENDOR',
                vendorStatus: 'PENDING'
            },
            data: {
                vendorStatus: 'ACTIVE'
            }
        });

        return NextResponse.json({
            success: true,
            message: `Approved ${result.count} vendor(s)`,
            approved: pendingVendors
        });

    } catch (error) {
        console.error('Failed to approve vendors:', error);
        return NextResponse.json({ error: 'Failed to approve vendors' }, { status: 500 });
    }
}
