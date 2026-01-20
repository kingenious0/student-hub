import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserExists } from '@/lib/auth/sync';

export async function POST(request: NextRequest) {
    try {
        const student = await ensureUserExists();
        if (!student) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentData = student as any;
        if (studentData.banned || studentData.walletFrozen) {
            return NextResponse.json({ error: 'Account restricted' }, { status: 403 });
        }

        const body = await request.json();

        // Normalize input: Support both new "items" array and legacy "productId" single mode
        let cartItems = [];
        const { fulfillmentType = 'PICKUP' } = body;

        if (body.items && Array.isArray(body.items)) {
            cartItems = body.items;
        } else if (body.productId) {
            cartItems = [{ id: body.productId, quantity: body.quantity || 1 }];
        } else {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        // 1. Fetch all products to validate prices & stock
        const productIds = cartItems.map((i: any) => i.id);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                vendor: true,
                flashSale: { where: { isActive: true } }
            }
        });

        // Map for quick lookup
        const productMap = new Map(products.map(p => [p.id, p]));

        // 2. Group items by Vendor
        const vendorGroups: Record<string, typeof cartItems> = {};
        let grandTotal = 0;

        // Validation & Grouping Loop
        for (const item of cartItems) {
            const product = productMap.get(item.id);
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 404 });
            }

            // Determine Price (Flash Sale Logic)
            let finalPrice = product.price;
            let activeFlashSaleId = null;

            if (product.flashSale) {
                const now = new Date();
                const { startTime, endTime, salePrice, stockSold, stockLimit } = product.flashSale;
                if (now >= startTime && now <= endTime && stockSold < stockLimit) {
                    finalPrice = salePrice;
                    activeFlashSaleId = product.flashSale.id;
                }
            }

            // check stock (TODO in future: use product.stockQuantity)

            // Add metadata to item for processing
            const processedItem = {
                ...item,
                finalPrice,
                title: product.title,
                vendorId: product.vendorId,
                activeFlashSaleId
            };

            if (!vendorGroups[product.vendorId]) {
                vendorGroups[product.vendorId] = [];
            }
            vendorGroups[product.vendorId].push(processedItem);
        }

        // 3. Create Database Records (Transaction)
        const paystackRef = `OMNI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await prisma.$transaction(async (tx) => {
            // A. Create OrderGroup
            const orderGroup = await tx.orderGroup.create({
                data: {
                    paystackRef,
                    totalAmount: 0, // Will update after summing
                    studentId: student.id,
                    status: 'PENDING'
                }
            });

            let calculatedGrandTotal = 0;

            // B. Create Order per Vendor
            for (const [vendorId, items] of Object.entries(vendorGroups)) {
                let vendorSubtotal = 0;

                // Sum items
                for (const item of items) {
                    vendorSubtotal += (item.finalPrice * item.quantity);
                }

                // Add Delivery Fee (Per Vendor Shipment)
                // Logic: If fulfillmentType is DELIVERY, add fee. 
                // Future: Check if specific vendor supports delivery.
                const deliveryFee = fulfillmentType === 'DELIVERY' ? 10.00 : 0.00;
                const vendorTotal = vendorSubtotal + deliveryFee;
                calculatedGrandTotal += vendorTotal;

                // Create Order
                const order = await tx.order.create({
                    data: {
                        orderGroupId: orderGroup.id,
                        studentId: student.id,
                        vendorId: vendorId,
                        amount: vendorTotal,
                        fulfillmentType: fulfillmentType as 'PICKUP' | 'DELIVERY',
                        status: 'PENDING',
                        escrowStatus: 'PENDING',
                    }
                });

                // Create OrderItems
                for (const item of items) {
                    await tx.orderItem.create({
                        data: {
                            orderId: order.id,
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.finalPrice,
                            productSnapshot: { title: item.title } // Keep record of title
                        }
                    });

                    // Increment Flash Sale Stock
                    if (item.activeFlashSaleId) {
                        await tx.flashSale.update({
                            where: { id: item.activeFlashSaleId },
                            data: { stockSold: { increment: item.quantity } }
                        });
                    }
                }
            }

            // C. Update Grand Total
            await tx.orderGroup.update({
                where: { id: orderGroup.id },
                data: { totalAmount: calculatedGrandTotal }
            });

            grandTotal = calculatedGrandTotal;
        });

        // 4. Return Success
        return NextResponse.json({
            success: true,
            paystackRef, // Frontend uses this to initialize Paystack
            totalAmount: grandTotal,
            email: student.email,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: 'System Error', details: String(error) }, { status: 500 });
    }
}

