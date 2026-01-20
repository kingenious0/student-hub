import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Verify a Paystack payment and generate the Secure Release Key for escrow release
 * This endpoint should be called after the student completes payment
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reference } = body;

        if (!reference) {
            return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
        }

        // 1. Verify payment with Paystack
        const { verifyTransaction } = await import('@/lib/payments/paystack');
        const verification = await verifyTransaction(reference);

        if (!verification.status || verification.data.status !== 'success') {
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }

        // 2. Find OrderGroup
        const orderGroup = await prisma.orderGroup.findUnique({
            where: { paystackRef: reference },
            include: { orders: true }
        });

        if (!orderGroup) {
            return NextResponse.json({ error: 'Order Group not found' }, { status: 404 });
        }

        // Idempotency check (if already paid, return existing)
        // Group doesn't have explicit paid status yet (I added 'status' in schema but check orders)
        const isAlreadyPaid = orderGroup.orders.some(o => o.status !== 'PENDING' && o.status !== 'CANCELLED');

        if (isAlreadyPaid) {
            return NextResponse.json({
                success: true,
                message: 'Payment already processed',
            });
        }

        // 3. Process Payments & Generate Keys
        // We update each order individually to give unique keys
        const updates = orderGroup.orders.map(async (order) => {
            const releaseKey = Math.floor(100000 + Math.random() * 900000).toString();
            return prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'PAID',
                    escrowStatus: 'HELD',
                    releaseKey: releaseKey,
                    paidAt: new Date()
                }
            });
        });

        await Promise.all(updates);

        // Update Group Status? (Optional, if I added status field)
        // prisma.orderGroup.update(...)

        return NextResponse.json({
            success: true,
            message: 'Payment verified. Orders confirmed.',
        });

    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: 'Verification System Error' }, { status: 500 });
    }
}

