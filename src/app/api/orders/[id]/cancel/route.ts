// export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        let { userId } = await auth();
        let user: any = null;

        const { id } = await params;

        // 1. Standard Web Auth
        if (userId) {
            user = await prisma.user.findUnique({
                where: { clerkId: userId },
            });
        }
        // 2. Hybrid Mobile Auth Fallback
        else {
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                const isVerified = cookieStore.get('OMNI_IDENTITY_VERIFIED')?.value === 'TRUE';
                const hybridClerkId = cookieStore.get('OMNI_HYBRID_SYNCED')?.value;

                if (isVerified && hybridClerkId) {
                    user = await prisma.user.findUnique({
                        where: { clerkId: hybridClerkId }
                    });

                    if (user) {
                        userId = hybridClerkId;
                    }
                }
            } catch (e) {
                console.error('Hybrid auth fallback failed:', e);
            }
        }

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership
        if (order.studentId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Cannot cancel completed or already cancelled/refunded orders
        if (['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
            return NextResponse.json({ error: 'Order cannot be cancelled in its current state' }, { status: 400 });
        }

        // Logic for refund
        const statusUpdate: { status: 'CANCELLED'; escrowStatus?: 'REFUNDED' } = { status: 'CANCELLED' };

        if (order.escrowStatus === 'HELD') {
            statusUpdate.escrowStatus = 'REFUNDED';
            // In a real app, this is where you'd trigger the Paystack refund API
            // For this project, we update internal state to reflect the refund
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: statusUpdate,
        });

        // If a runner was assigned, free them up
        if (order.runnerId) {
            await prisma.user.update({
                where: { id: order.runnerId },
                data: { runnerStatus: 'ONLINE' },
            });
        }

        return NextResponse.json({
            success: true,
            message: order.escrowStatus === 'HELD' ? 'Order cancelled and funds refunded to escrow.' : 'Order cleared successfully.',
            order: updatedOrder
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
    }
}
