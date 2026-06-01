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
        console.log(`[PaymentVerify] Verifying reference: ${reference}`);

        let verification;
        try {
            verification = await verifyTransaction(reference);
        } catch (e) {
            console.error(`[PaymentVerify] Paystack API Call Failed:`, e);
            return NextResponse.json({ error: 'Payment Provider Error', details: String(e) }, { status: 502 });
        }

        if (!verification.status || verification.data.status !== 'success') {
            console.error(`[PaymentVerify] Failed. Status: ${verification.data.status}, Message: ${verification.message}`);
            return NextResponse.json({ error: 'Payment Failed or Declined', details: verification.message }, { status: 400 });
        }

        console.log(`[PaymentVerify] Paystack Success. Amount: ${verification.data.amount}`);

        // 2. Find OrderGroup
        const orderGroup = await prisma.orderGroup.findUnique({
            where: { paystackRef: reference },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        if (!orderGroup) {
            console.error(`[PaymentVerify] OrderGroup Not Found for ref: ${reference}`);
            return NextResponse.json({ error: 'Order Record Not Found', ref: reference }, { status: 404 });
        }

        // Idempotency check (if already paid, return existing)
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
            
            // Check if all items in this order are ready-made
            const allReadyMade = order.items.every(item => item.product?.isReadyMade ?? true);
            const targetStatus = allReadyMade ? 'READY' : 'PAID';

            return prisma.order.update({
                where: { id: order.id },
                data: {
                    status: targetStatus,
                    escrowStatus: 'HELD',
                    releaseKey: releaseKey,
                    paidAt: new Date()
                }
            });
        });

        const updatedOrders = await Promise.all(updates);

        // Update Group Status? (Optional, if I added status field)
        // prisma.orderGroup.update(...)

        return NextResponse.json({
            success: true,
            message: 'Payment verified. Orders confirmed.',
            order: updatedOrders[0],
            orders: updatedOrders
        });

    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: 'Verification System Error' }, { status: 500 });
    }
}

