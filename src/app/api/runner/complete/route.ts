import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// Extract the transaction client type from Prisma's $transaction method
type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Complete a delivery and award XP to the runner
 */
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

        // Use transaction for consistency
        const result = await prisma.$transaction(async (tx: TransactionClient) => {
            // 1. Verify order exists and belongs to this runner
            const order = await tx.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            if (order.runnerId !== user.id) {
                throw new Error('This delivery does not belong to you');
            }

            if (order.status !== 'PICKED_UP') {
                throw new Error('Order must be in PICKED_UP status to complete');
            }

            // 2. Update order to COMPLETED
            const completedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'COMPLETED',
                    deliveredAt: new Date(),
                },
            });

            // 3. Award XP to runner
            const xpAwarded = order.runnerXpAwarded || 100;
            const newXP = user.xp + xpAwarded;

            // 4. Calculate level (simple: every 100 XP = 1 level)
            const newLevel = Math.floor(newXP / 100) + 1;
            const leveledUp = newLevel > user.runnerLevel;

            // 5. Update runner stats
            const updatedRunner = await tx.user.update({
                where: { id: user.id },
                data: {
                    xp: newXP,
                    runnerLevel: newLevel,
                    runnerStatus: 'IDLE', // Back to idle after delivery
                },
            });

            return {
                order: completedOrder,
                runner: updatedRunner,
                xpAwarded,
                leveledUp,
                newLevel,
            };
        });

        return NextResponse.json({
            success: true,
            message: result.leveledUp
                ? `🎉 Delivery complete! You leveled up to Level ${result.newLevel}!`
                : '✅ Delivery completed!',
            xpAwarded: result.xpAwarded,
            totalXP: result.runner.xp,
            level: result.runner.runnerLevel,
            leveledUp: result.leveledUp,
            earnings: result.order.runnerEarnings,
        });

    } catch (error) {
        console.error('Complete delivery error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to complete delivery';

        let status = 500;
        if (errorMessage.includes('not found')) status = 404;
        if (errorMessage.includes('does not belong') || errorMessage.includes('must be in')) status = 409;

        return NextResponse.json(
            { error: errorMessage },
            { status }
        );
    }
}
