// src/app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPaymentRequest } from '@/lib/payments/paystack';
import { generateOrderQRCode } from '@/lib/qr/generator';

/**
 * Verify a Paystack payment and generate QR code for escrow release
 * This endpoint should be called after the student completes payment
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { request_code } = body;

        if (!request_code) {
            return NextResponse.json(
                { error: 'Payment request code is required' },
                { status: 400 }
            );
        }

        // Verify payment with Paystack
        const verification = await verifyPaymentRequest(request_code);

        if (!verification.status) {
            return NextResponse.json(
                { error: 'Payment verification failed' },
                { status: 400 }
            );
        }

        // Check if payment was successful
        if (!verification.data.paid) {
            return NextResponse.json(
                { error: 'Payment not completed', paid: false },
                { status: 400 }
            );
        }

        // Find the order by Paystack reference
        const order = await prisma.order.findUnique({
            where: { paystackRef: request_code },
            include: {
                product: true,
                student: true,
                vendor: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if already processed
        if (order.escrowStatus === 'HELD') {
            return NextResponse.json({
                success: true,
                message: 'Payment already verified',
                order: {
                    id: order.id,
                    status: order.status,
                    escrowStatus: order.escrowStatus,
                    qrCodeValue: order.qrCodeValue,
                },
            });
        }

        // Generate QR code for delivery verification
        const { qrCodeValue, qrCodeDataURL } = await generateOrderQRCode(
            order.id,
            order.amount,
            order.vendorId,
            order.studentId
        );

        // Update order: mark as PAID and escrow as HELD
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'PAID',
                escrowStatus: 'HELD',
                qrCodeValue,
                paidAt: new Date(),
            },
        });

        // TODO: Send notification to vendor about new order
        // TODO: Send QR code to student via email/SMS

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully. Funds are held in escrow.',
            order: {
                id: updatedOrder.id,
                status: updatedOrder.status,
                escrowStatus: updatedOrder.escrowStatus,
                amount: updatedOrder.amount,
                product: {
                    title: order.product.title,
                    imageUrl: order.product.imageUrl,
                },
                vendor: {
                    name: order.vendor.name,
                    email: order.vendor.email,
                },
            },
            qrCode: {
                value: qrCodeValue,
                dataURL: qrCodeDataURL,
            },
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            {
                error: 'Payment verification failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
