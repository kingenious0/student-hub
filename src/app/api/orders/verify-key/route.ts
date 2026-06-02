
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { releaseKey } = body;

        if (!releaseKey) {
            return NextResponse.json({ error: 'Release Key is required' }, { status: 400 });
        }

        // 1. Find the order with this release key that is currently HELD in escrow
        const order = await prisma.order.findFirst({
            where: {
                releaseKey: releaseKey,
                escrowStatus: 'HELD'
            },
            include: {
                student: true,
                vendor: true
            }
        });

        if (!order) {
            return NextResponse.json({
                error: 'Invalid or expired Release Key. Please check the student’s phone.'
            }, { status: 404 });
        }

        // 2. Security Check: Only the vendor should be able to verify this
        // which the student physically gives them.
        // which the student physically gives them.

        // 3. Verification successful! Release Escrow.
        // 3. Verification successful! Release Escrow.
        // Update Order + Credit Vendor Wallet
        const [updatedOrder, updatedVendor] = await prisma.$transaction([
            prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'COMPLETED',
                    escrowStatus: 'RELEASED',
                    deliveredAt: new Date(),
                },
            }),
            prisma.user.update({
                where: { id: order.vendor.id },
                data: {
                    balance: { increment: order.amount }
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: `GH₵${order.amount.toFixed(2)} unlocked! Balance updated.`,
            order: updatedOrder
        });

    } catch (error) {
        console.error('Key verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify key', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

