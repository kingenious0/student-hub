import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Using 'id' to match parent segment
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: orderId } = await params;

        // Verify Vendor Ownership & Order Status
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { vendor: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Vendor must be the authenticated user (via Clerk ID mapping)
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user || order.vendorId !== user.id) {
            return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 });
        }

        if (order.status !== 'READY') {
            return NextResponse.json({ error: 'Order must be READY to be completed' }, { status: 400 });
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                escrowStatus: 'RELEASED',
                deliveredAt: new Date(),
            }
        });

        return NextResponse.json({ success: true, message: 'Order completed' });

    } catch (error) {
        console.error('Self-delivery Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
