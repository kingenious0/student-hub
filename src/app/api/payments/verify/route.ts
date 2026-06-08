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

        // 2. Process payment verification using the shared helper
        const { confirmOrderGroupPayment } = await import('@/lib/payments/verify');
        const result = await confirmOrderGroupPayment(reference);

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Verification Failed' }, { status: result.status || 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified. Orders confirmed.',
            orders: result.orders
        });

    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: 'Verification System Error' }, { status: 500 });
    }
}

