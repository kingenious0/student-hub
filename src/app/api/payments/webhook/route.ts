import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/paystack';
import { confirmOrderGroupPayment } from '@/lib/payments/verify';

export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get('x-paystack-signature');
        if (!signature) {
            console.warn('[PaymentsWebhook] Missing x-paystack-signature header');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        // Read raw body as text for HMAC verification
        const rawBody = await request.text();
        const isValid = await verifyWebhookSignature(rawBody, signature);

        if (!isValid) {
            console.warn('[PaymentsWebhook] Invalid signature match');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        console.log(`[PaymentsWebhook] Received event: ${payload.event}`);

        if (payload.event === 'charge.success') {
            const data = payload.data;
            if (data && data.status === 'success' && data.reference) {
                console.log(`[PaymentsWebhook] Processing successful charge for ref: ${data.reference}`);
                const result = await confirmOrderGroupPayment(data.reference);
                
                if (!result.success) {
                    console.error(`[PaymentsWebhook] Order processing failed: ${result.error}`);
                    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
                }
                
                console.log(`[PaymentsWebhook] Order processed successfully for ref: ${data.reference}`);
            }
        }

        // Always acknowledge Paystack webhooks with a 200 OK
        return NextResponse.json({ success: true, message: 'Webhook processed' });

    } catch (error) {
        console.error('[PaymentsWebhook] System error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
