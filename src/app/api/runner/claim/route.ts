
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// Extract the transaction client type from Prisma's $transaction method
type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user || !user.isRunner) {
            return NextResponse.json(
                { error: 'User is not an active runner' },
                { status: 403 }
            );
        }

        // Use transaction to ensure consistency
        const result = await prisma.$transaction(async (tx: TransactionClient) => {
            // 1. Check if order is available
            const order = await tx.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            if (order.status !== 'READY') {
                throw new Error('Order is not ready for pickup');
            }

            if (order.runnerId) {
                throw new Error('Order already claimed by another runner');
            }

            // 2. Set runner status to DELIVERING
            await tx.user.update({
                where: { id: user.id },
                data: { runnerStatus: 'DELIVERING' },
            });

            // 3. Assign order to runner and update status
            // Note: Setting status to PICKED_UP immediately upon claim for MVP flow
            // Ideally this would be a separate step "Confirm Pickup"
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    runnerId: user.id,
                    status: 'PICKED_UP',
                    // Set mock earnings if not present
                    runnerEarnings: order.runnerEarnings || Math.max(2.00, order.amount * 0.15),
                    runnerXpAwarded: order.runnerXpAwarded || 100,
                },
                include: {
                    product: true,
                    student: true,
                    vendor: true,
                }
            });

            return updatedOrder;
        });

        return NextResponse.json({
            success: true,
            order: result,
        });

    } catch (error) {
        console.error('Claim delivery error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to claim delivery';

        let status = 500;
        if (errorMessage === 'Order not found') status = 404;
        if (errorMessage.includes('not ready') || errorMessage.includes('already claimed')) status = 409; // Conflict

        return NextResponse.json(
            { error: errorMessage },
            { status }
        );
    }
}
