import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserExists } from '@/lib/auth/sync';

interface ProcessedCartItem {
    id: string;
    quantity: number;
    finalPrice: number;
    title: string;
    vendorId: string;
    activeFlashSaleId: string | null;
}

async function getAuthenticatedStudent(): Promise<any | null> {
    let student = await ensureUserExists();
    if (student) return student;

    try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const isVerified = cookieStore.get('OMNI_IDENTITY_VERIFIED')?.value === 'TRUE';
        const hybridClerkId = cookieStore.get('OMNI_HYBRID_SYNCED')?.value;

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

        const processedItem: ProcessedCartItem = {
            id: item.id,
            quantity: item.quantity,
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

    return { vendorGroups };
}

async function executeOrderCreationTransaction(
    tx: any,
    studentId: string,
    vendorGroups: Record<string, ProcessedCartItem[]>,
    fulfillmentType: string,
    fulfillmentNote: string | null,
    paystackRef: string
): Promise<number> {
    const orderGroup = await tx.orderGroup.create({
        data: {
            paystackRef,
            totalAmount: 0,
            studentId
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
                    productSnapshot: { title: item.title }
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
    const finalGrandTotal = calculatedGrandTotal + platformFee;

    await tx.orderGroup.update({
        where: { id: orderGroup.id },
        data: { totalAmount: finalGrandTotal }
    });

    return finalGrandTotal;
}

export async function POST(request: NextRequest) {
    try {
        const student = await getAuthenticatedStudent();
        if (!student) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentData = student as any;
        if (studentData.banned || studentData.walletFrozen) {
            return NextResponse.json({ error: 'Account restricted' }, { status: 403 });
        }

        const body = await request.json();
        const { fulfillmentType = 'PICKUP', fulfillmentNote = null } = body;

        let cartItems = [];
        if (body.items && Array.isArray(body.items)) {
            cartItems = body.items;
        } else if (body.productId) {
            cartItems = [{ id: body.productId, quantity: body.quantity || 1 }];
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

        const paystackRef = `OMNI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        let grandTotal = 0;

        await prisma.$transaction(async (tx) => {
            grandTotal = await executeOrderCreationTransaction(
                tx,
                student.id,
                vendorGroups,
                fulfillmentType,
                fulfillmentNote,
                paystackRef
            );
        });

        return NextResponse.json({
            success: true,
            paystackRef,
            totalAmount: grandTotal,
            email: student.email,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: 'System Error', details: String(error) }, { status: 500 });
    }
}


