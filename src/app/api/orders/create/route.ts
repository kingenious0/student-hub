// src/app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { createPaymentRequest, createCustomer } from '@/lib/payments/paystack';

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
        const { productId, quantity = 1 } = body;

        // Get the student user
        const student = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!student) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get the product
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { vendor: true },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const totalAmount = product.price * quantity;

        // Create order in database (PENDING status)
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                studentId: student.id,
                vendorId: product.vendorId,
                amount: totalAmount,
                status: 'PENDING',
                escrowStatus: 'PENDING',
            },
        });

        // Create or get Paystack customer
        let customerCode: string;
        try {
            const customer = await createCustomer({
                email: student.email,
                first_name: student.name?.split(' ')[0],
                last_name: student.name?.split(' ').slice(1).join(' '),
            });
            customerCode = customer.customer_code;
        } catch (error) {
            // Customer might already exist, use email
            customerCode = student.email;
        }

        // Create Paystack payment request
        const paymentRequest = await createPaymentRequest({
            customer: customerCode,
            amount: totalAmount * 100, // Convert to kobo/pesewas
            description: `Order for ${product.title}`,
            line_items: [
                {
                    name: product.title,
                    amount: product.price * 100,
                    quantity,
                },
            ],
            currency: 'GHS',
            metadata: {
                orderId: order.id,
                productId: product.id,
                studentId: student.id,
                vendorId: product.vendorId,
            },
        });

        // Update order with Paystack reference
        await prisma.order.update({
            where: { id: order.id },
            data: {
                paystackRef: paymentRequest.data.request_code,
            },
        });

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                amount: totalAmount,
                status: order.status,
            },
            payment: {
                request_code: paymentRequest.data.request_code,
                amount: paymentRequest.data.amount,
                // In production, you'd redirect to Paystack's payment page
                // For now, we'll use the offline reference for testing
                offline_reference: paymentRequest.data.request_code,
            },
        });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
