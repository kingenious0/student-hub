
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, pickupCode } = body;

        if (!orderId || !pickupCode) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        // Security: Ensure the caller is the VENDOR of this order
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user || user.id !== order.vendorId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Verify Code
        if (order.pickupCode !== pickupCode) {
            return NextResponse.json({ error: 'Invalid Runner Key!' }, { status: 400 });
        }

        // Mark order as completed (student picked up)
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                escrowStatus: 'RELEASED',
                deliveredAt: new Date()
            }
        });

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error) {
        console.error('Pickup verify error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
