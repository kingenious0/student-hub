import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

// Use Node's crypto for simpler HMAC if not on Edge, but sticking to standard is fine.
// The helper uses standard Web Crypto API.
import { verifyWebhookSignature } from '@/lib/payments/paystack';

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get('x-paystack-signature');
        if (!signature) {
            return NextResponse.json({ error: 'No signature' }, { status: 400 });
        }

        const bodyText = await req.text(); // Raw body for HMAC

        // Use the verifyWebhookSignature from lib, but ensure it matches Node env if needed.
        // Actually, importing crypto module directly handles HMAC more reliably in Node environment than Web Crypto sometimes for large payloads.
        // Let's implement verification locally here to be 100% sure of the algorithm matches Paystack (SHA512).

        const secret = process.env.PAYSTACK_SECRET_KEY!;
        const hash = crypto.createHmac('sha512', secret).update(bodyText).digest('hex');

        if (hash !== signature) {
            console.error('Invalid Paystack Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Parse JSON
        const event = JSON.parse(bodyText);

        console.log(`[Paystack Webhook] Received Event: ${event.event}`);

        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;
            const metadata = data.metadata || {};
            const orderId = metadata.orderId || metadata.custom_fields?.find((f: any) => f.variable_name === 'orderId' || f.variable_name === 'order_id')?.value;

            console.log(`[Paystack Webhook] Processing Success for Ref: ${reference}, Order: ${orderId}`);

            if (orderId) {
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'PAID',
                        paidAt: new Date(),
                    },
                });
                console.log(`[Paystack Webhook] Order ${orderId} marked as PAID`);
            } else {
                const orderGroup = await prisma.orderGroup.findUnique({
                    where: { paystackRef: reference },
                    select: { id: true },
                });

                if (!orderGroup) {
                    console.warn(`[Paystack Webhook] No order group found for ref ${reference}`);
                } else {
                    await prisma.order.updateMany({
                        where: { orderGroupId: orderGroup.id },
                        data: { status: 'PAID', paidAt: new Date() },
                    });
                    console.log(`[Paystack Webhook] OrderGroup ${orderGroup.id} marked as PAID`);
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('[Paystack Webhook] Error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
