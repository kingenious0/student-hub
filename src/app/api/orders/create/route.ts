// src/app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserExists } from '@/lib/auth/sync';

// export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        // Sync user and get their DB record
        let student = await ensureUserExists();

        // Hybrid Auth Fallback for WebViews
        if (!student) {
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                const isVerified = cookieStore.get('OMNI_IDENTITY_VERIFIED')?.value === 'TRUE';
                const hybridClerkId = cookieStore.get('OMNI_HYBRID_SYNCED')?.value;

                if (isVerified && hybridClerkId) {
                    student = await prisma.user.findUnique({
                        where: { clerkId: hybridClerkId },
                        select: {
                            id: true,
                            clerkId: true,
                            email: true,
                            name: true,
                            role: true,
                            university: true,
                            onboarded: true,
                            isRunner: true,
                            runnerStatus: true,
                            xp: true,
                            runnerLevel: true,
                            currentHotspot: true,
                            lastActive: true,
                            walletFrozen: true,
                            banned: true,
                            banReason: true,
                            createdAt: true,
                            updatedAt: true,
                        }
                    });
                }
            } catch (e) {
                console.error('Hybrid auth fallback failed:', e);
            }
        }

        if (!student) {
            return NextResponse.json(
                { error: 'Unauthorized', details: 'User sync failed or not authenticated' },
                { status: 401 }
            );
        }

        // Check for Admin Blocks (Freeze/Ban)
        // Note: ensureUserExists has been updated to return these fields
        const studentData = student as any; // Type assertion since return type might not be fully inferred yet

        if (studentData.banned) {
            return NextResponse.json(
                { error: `Account banned: ${studentData.banReason || 'Contact support'}` },
                { status: 403 }
            );
        }

        if (studentData.walletFrozen) {
            return NextResponse.json(
                { error: 'Your wallet has been frozen by an administrator. Purchases are disabled.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { productId, quantity = 1, fulfillmentType = 'PICKUP' } = body;

        if (!productId) {
            return NextResponse.json({ error: 'Missing Product ID' }, { status: 400 });
        }

        // Get the product with active flash sale
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                vendor: true,
                flashSale: {
                    where: { isActive: true }
                }
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // --- PRICE CALCULATION LOGIC ---
        let finalPrice = product.price;
        let activeFlashSaleId = null;

        if (product.flashSale) {
            const now = new Date();
            const { startTime, endTime, salePrice, stockSold, stockLimit } = product.flashSale;

            // Check if within time window AND has stock
            if (now >= startTime && now <= endTime && stockSold < stockLimit) {
                console.log(`⚡ Applying Flash Sale Price: ${salePrice} (Original: ${product.price})`);
                finalPrice = salePrice;
                activeFlashSaleId = product.flashSale.id;
            }
        }

        // Calculation
        const deliveryFee = fulfillmentType === 'DELIVERY' ? 5.00 : 0.00;
        const totalAmount = (finalPrice * quantity) + deliveryFee;

        // Create order in database (PENDING status)
        console.log(`Creating order for product ${productId}, student ${student.id}, vendor ${product.vendorId}`);

        // Use transaction to ensure we update flash sale stock atomically if needed
        const order = await prisma.$transaction(async (tx) => {
            // 1. Create the order
            const newOrder = await tx.order.create({
                data: {
                    productId: product.id,
                    studentId: student.id,
                    vendorId: product.vendorId,
                    amount: totalAmount,
                    fulfillmentType: fulfillmentType as 'PICKUP' | 'DELIVERY',
                    status: 'PENDING',
                    escrowStatus: 'PENDING',
                },
            });

            // 2. If it was a flash sale, increment the stockSold
            if (activeFlashSaleId) {
                await tx.flashSale.update({
                    where: { id: activeFlashSaleId },
                    data: { stockSold: { increment: quantity } }
                });
            }

            return newOrder;
        });

        console.log(`✅ Order created successfully: ${order.id}`);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            totalAmount,
            email: student.email,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
            productTitle: product.title,
            fulfillmentType,
        });
    } catch (error) {
        console.error('❌ Order creation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create order',
                details: error instanceof Error ? error.message : 'Unknown database error'
            },
            { status: 500 }
        );
    }
}

