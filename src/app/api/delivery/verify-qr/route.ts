// src/app/api/delivery/verify-qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { verifyQRCode } from '@/lib/qr/generator';

/**
 * Verify QR code and release escrow payment to vendor
 * This is the critical endpoint that completes the transaction
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
        const { qrCodeValue } = body;

        if (!qrCodeValue) {
            return NextResponse.json(
                { error: 'QR code value is required' },
                { status: 400 }
            );
        }

        // Verify QR code authenticity and extract payload
        const qrPayload = verifyQRCode(qrCodeValue);

        if (!qrPayload) {
            return NextResponse.json(
                { error: 'Invalid or expired QR code' },
                { status: 400 }
            );
        }

        // Find the order
        const order = await prisma.order.findUnique({
            where: { id: qrPayload.orderId },
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

        // Verify the QR code matches the order
        if (order.qrCodeValue !== qrCodeValue) {
            return NextResponse.json(
                { error: 'QR code does not match order' },
                { status: 400 }
            );
        }

        // Check if escrow is in HELD status
        if (order.escrowStatus !== 'HELD') {
            return NextResponse.json(
                {
                    error: 'Escrow not in HELD status',
                    currentStatus: order.escrowStatus
                },
                { status: 400 }
            );
        }

        // Get the current user to verify they're either student or vendor
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Only student or vendor can scan the QR code
        const isStudent = currentUser.id === order.studentId;
        const isVendor = currentUser.id === order.vendorId;

        if (!isStudent && !isVendor) {
            return NextResponse.json(
                { error: 'Unauthorized to verify this order' },
                { status: 403 }
            );
        }

        // Release escrow and complete order
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'COMPLETED',
                escrowStatus: 'RELEASED',
                deliveredAt: new Date(),
            },
        });

        // TODO: Trigger Paystack payout to vendor
        // TODO: Send confirmation notifications to both parties

        return NextResponse.json({
            success: true,
            message: 'QR code verified! Escrow released to vendor.',
            order: {
                id: updatedOrder.id,
                status: updatedOrder.status,
                escrowStatus: updatedOrder.escrowStatus,
                amount: updatedOrder.amount,
                deliveredAt: updatedOrder.deliveredAt,
                product: {
                    title: order.product.title,
                },
                vendor: {
                    name: order.vendor.name,
                },
                student: {
                    name: order.student.name,
                },
            },
            scannedBy: isStudent ? 'student' : 'vendor',
        });
    } catch (error) {
        console.error('QR verification error:', error);
        return NextResponse.json(
            {
                error: 'QR verification failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
