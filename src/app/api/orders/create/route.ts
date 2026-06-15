import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserExists } from '@/lib/auth/sync';
import { sendPushNotification } from '@/lib/notifications/push';
import { sendSMS } from '@/lib/sms';

interface SelectedModifier {
  groupName: string;
  optionName: string;
  priceDiff: number;
}

interface ProcessedCartItem {
    id: string;
    quantity: number;
    finalPrice: number;
    title: string;
    vendorId: string;
    activeFlashSaleId: string | null;
    selectedModifiers?: SelectedModifier[];
}

async function getAuthenticatedStudent(): Promise<any | null> {
    let student = await ensureUserExists();
    if (student) return student;

    try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const isVerified = cookieStore.get('LH_IDENTITY_VERIFIED')?.value === 'TRUE';
        const hybridClerkId = cookieStore.get('LH_HYBRID_SYNCED')?.value;

        if (isVerified && hybridClerkId) {
            return await prisma.user.findUnique({
                where: { clerkId: hybridClerkId },
            });
        }
    } catch (e) {
        console.error('Hybrid auth fallback failed in order creation:', e);
    }
    return null;
}

function processCartItems(
    cartItems: any[],
    products: any[]
): { error?: string; status?: number; vendorGroups?: Record<string, ProcessedCartItem[]> } {
    const productMap = new Map(products.map(p => [p.id, p]));
    const vendorGroups: Record<string, ProcessedCartItem[]> = {};

    for (const item of cartItems) {
        const product = productMap.get(item.id);
        if (!product) {
            return { error: `Product not found: ${item.id}`, status: 404 };
        }

        let finalPrice = Number(product.price);
        let activeFlashSaleId = null;

        if (product.flashSale) {
            const now = new Date();
            const { startTime, endTime, salePrice, stockSold, stockLimit } = product.flashSale;
            if (now >= startTime && now <= endTime && stockSold < stockLimit) {
                finalPrice = salePrice;
                activeFlashSaleId = product.flashSale.id;
            }
        }

        const modifiersTotal = (item.selectedModifiers || []).reduce((sum: number, m: SelectedModifier) => sum + (m.priceDiff || 0), 0);

        const processedItem: ProcessedCartItem = {
            id: item.id,
            quantity: item.quantity,
            finalPrice: finalPrice + modifiersTotal,
            title: product.title,
            vendorId: product.vendorId,
            activeFlashSaleId,
            selectedModifiers: item.selectedModifiers || [],
        };

        if (!vendorGroups[product.vendorId]) {
            vendorGroups[product.vendorId] = [];
        }
        vendorGroups[product.vendorId].push(processedItem);
    }

    return { vendorGroups };
}

async function executeOrderCreationTransaction(
    tx: any,
    studentId: string,
    vendorGroups: Record<string, ProcessedCartItem[]>,
    fulfillmentType: string,
    fulfillmentNote: string | null,
    paystackRef: string,
    couponCode: string | null
): Promise<number> {
    let couponId: string | null = null;
    let discountAmount = 0;

    if (couponCode) {
        const coupon = await tx.coupon.findUnique({
            where: { code: couponCode.trim().toUpperCase() }
        });

        if (!coupon) {
            throw new Error('Invalid promo code');
        }

        if (!coupon.isActive) {
            throw new Error('This promo code is no longer active');
        }

        const now = new Date();
        if (now > coupon.expiryDate) {
            throw new Error('This promo code has expired');
        }

        if (coupon.usedCount >= coupon.maxUses) {
            throw new Error('This promo code has reached its maximum usage limit');
        }

        let itemsSubtotal = 0;
        for (const [vendorId, items] of Object.entries(vendorGroups)) {
            for (const item of items) {
                itemsSubtotal += (item.finalPrice * item.quantity);
            }
        }

        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = itemsSubtotal * (coupon.discountValue / 100);
        } else if (coupon.discountType === 'FIXED') {
            discountAmount = Math.min(coupon.discountValue, itemsSubtotal);
        }

        await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
        });

        couponId = coupon.id;
    }

    const orderGroup = await tx.orderGroup.create({
        data: {
            paystackRef,
            totalAmount: 0,
            studentId,
            couponId
        }
    });

    let calculatedGrandTotal = 0;

    for (const [vendorId, items] of Object.entries(vendorGroups)) {
        let vendorSubtotal = 0;
        for (const item of items) {
            vendorSubtotal += (item.finalPrice * item.quantity);
        }

        const settings = await tx.systemSettings.findUnique({ where: { id: 'GLOBAL_CONFIG' } });
        const deliveryFee = (fulfillmentType === 'DELIVERY') ? (settings?.deliveryFee ?? 5.00) : 0.00;
        const vendorTotal = vendorSubtotal + deliveryFee;
        calculatedGrandTotal += vendorTotal;

        const order = await tx.order.create({
            data: {
                orderGroupId: orderGroup.id,
                studentId,
                vendorId,
                amount: vendorTotal,
                fulfillmentType: fulfillmentType as 'PICKUP' | 'DELIVERY',
                fulfillmentNote: fulfillmentNote || null,
                status: 'PENDING',
                escrowStatus: 'PENDING',
            }
        });

        for (const item of items) {
            await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.finalPrice,
                    productSnapshot: { title: item.title },
                    modifierSnapshot: item.selectedModifiers?.length ? JSON.parse(JSON.stringify(item.selectedModifiers)) : undefined,
                }
            });

            if (item.activeFlashSaleId) {
                await tx.flashSale.update({
                    where: { id: item.activeFlashSaleId },
                    data: { stockSold: { increment: item.quantity } }
                });
            }
        }
    }

    const settings = await tx.systemSettings.findUnique({ where: { id: 'GLOBAL_CONFIG' } });
    const platformFee = settings?.platformFee ?? 2.00;
    const finalGrandTotal = Math.max(0, calculatedGrandTotal + platformFee - discountAmount);

    await tx.orderGroup.update({
        where: { id: orderGroup.id },
        data: { totalAmount: parseFloat(finalGrandTotal.toFixed(2)) }
    });

    return finalGrandTotal;
}

async function getOrCreateGuestUser(guestInfo: { name: string; phone: string }): Promise<{ user: any; email: string }> {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const email = `${guestId}@LaHustle-marketplace.com`;

    const user = await prisma.user.create({
        data: {
            clerkId: guestId,
            email,
            name: guestInfo.name,
            phoneNumber: guestInfo.phone,
            role: 'STUDENT',
            university: 'USTED',
            onboarded: true,
        }
    });

    return { user, email };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fulfillmentType = 'PICKUP', fulfillmentNote = null, couponCode = null, guestInfo } = body;

        let student = await getAuthenticatedStudent();
        let isGuestUser = false;
        let guestEmail = '';

        if (!student) {
            if (guestInfo && guestInfo.name && guestInfo.phone) {
                const result = await getOrCreateGuestUser(guestInfo);
                student = result.user;
                guestEmail = result.email;
                isGuestUser = true;
            } else {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const studentData = student as any;
        if (!isGuestUser && (studentData.banned || studentData.walletFrozen)) {
            return NextResponse.json({ error: 'Account restricted' }, { status: 403 });
        }

        let cartItems = [];
        if (body.items && Array.isArray(body.items)) {
            cartItems = body.items;
        } else if (body.productId) {
            cartItems = [{
                id: body.productId,
                quantity: body.quantity || 1,
                selectedModifiers: body.selectedModifiers || [],
            }];
        } else {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        const productIds = cartItems.map((i: any) => i.id);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                vendor: true,
                flashSale: { where: { isActive: true } }
            }
        });

        const { error, status, vendorGroups } = processCartItems(cartItems, products);
        if (error || !vendorGroups) {
            return NextResponse.json({ error }, { status: status || 400 });
        }

        if (!isGuestUser) {
            const recentPendingGroup = await prisma.orderGroup.findFirst({
                where: {
                    studentId: student.id,
                    createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
                    orders: { some: { status: 'PENDING' } }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (recentPendingGroup) {
                return NextResponse.json({
                    success: true,
                    paystackRef: recentPendingGroup.paystackRef,
                    totalAmount: recentPendingGroup.totalAmount,
                    email: student.email,
                    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                    message: 'Resuming existing pending order'
                });
            }
        }

        const paystackRef = `LaHustle-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        let grandTotal = 0;

        await prisma.$transaction(async (tx) => {
            grandTotal = await executeOrderCreationTransaction(
                tx,
                student.id,
                vendorGroups,
                fulfillmentType,
                fulfillmentNote,
                paystackRef,
                couponCode
            );
        });

        if (vendorGroups && Object.keys(vendorGroups).length > 0) {
            const vendorIds = Object.keys(vendorGroups);
            const vendors = await prisma.user.findMany({
                where: { id: { in: vendorIds } },
                select: { id: true, phoneNumber: true, shopName: true, name: true }
            });

            // Push notifications — only sent after payment via verify.ts
            // (removed premature push here to avoid confusing vendors)

            // In-App Notification only (no SMS at this stage — payment not yet confirmed).
            // The full SMS + push notification is dispatched by lib/payments/verify.ts
            // after Paystack confirms the payment successfully.
            for (const vendor of vendors) {
                const vendorItems = vendorGroups[vendor.id] || [];
                const itemsSummary = vendorItems.map(i => `${i.quantity}x ${i.title}`).join(', ');

                const { createNotification } = await import('@/lib/notifications/badge');
                await createNotification({
                    userId: vendor.id,
                    type: 'ORDER_CREATED',
                    title: '🕐 New Order Initiated',
                    body: `${itemsSummary} — awaiting payment`,
                    link: '/dashboard/vendor',
                });
            }
        }

        return NextResponse.json({
            success: true,
            paystackRef,
            totalAmount: grandTotal,
            email: isGuestUser ? guestEmail : student.email,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        });

    } catch (error: any) {
        console.error('Create Order Error:', error);
        const errorMessage = error?.message || 'System Error';

        const couponErrors = [
            'Invalid promo code',
            'This promo code is no longer active',
            'This promo code has expired',
            'This promo code has reached its maximum usage limit'
        ];

        if (couponErrors.includes(errorMessage)) {
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        return NextResponse.json({ error: 'System Error', details: String(error) }, { status: 500 });
    }
}
