import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { sendSMS } from '@/lib/sms';
import { getVendorTier } from '@/lib/vendor/tier';

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, shopName: true }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Get Body
        const body = await req.json();
        const { status } = body;

        // Find Order First (to get phone number)
        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                student: { select: { phoneNumber: true, name: true } },
                items: {
                    include: {
                        product: { select: { title: true } }
                    }
                }
            }
        });

        if (!order || order.vendorId !== vendor.id) {
            return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
        }

        // Determine if this vendor is food-tier for auto-complete logic
        const tier = await getVendorTier(vendor.id);

        // For food vendors: marking as READY auto-completes the order
        const targetStatus = (status === 'READY' && tier === 'FOOD') ? 'COMPLETED' : (status || 'READY');

        // Update
        await prisma.order.update({
            where: { id: params.id },
            data: { status: targetStatus }
        });

        // If auto-completed for food vendor, also release escrow and credit balance
        if (targetStatus === 'COMPLETED' && tier === 'FOOD') {
            await prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: params.id },
                    data: {
                        escrowStatus: 'RELEASED',
                        releaseKey: null,
                        deliveredAt: new Date(),
                    }
                });
                await tx.user.update({
                    where: { id: vendor.id },
                    data: {
                        balance: { increment: order.amount }
                    }
                });
            });
        }

        // Notification Logic
        if (targetStatus === 'READY' || targetStatus === 'COMPLETED') {
            if (order.student.phoneNumber) {
                const primaryItem = order.items?.[0];
                const itemTitle = primaryItem ? primaryItem.product.title : 'Details';
                const displayTitle = order.items.length > 1 ? `${itemTitle} +${order.items.length - 1}` : itemTitle;

                const isPickup = order.fulfillmentType === 'PICKUP';

                const msg = targetStatus === 'COMPLETED'
                    ? `LaHustle: Your order for ${displayTitle} at ${vendor.shopName || 'Vendor'} is ready and completed! Enjoy your meal.`
                    : isPickup
                        ? `LaHustle: Your order for ${displayTitle} at ${vendor.shopName || 'Vendor'} is ready for pickup! Please go to the vendor's location to collect it.`
                        : `LaHustle: Your order for ${displayTitle} at ${vendor.shopName || 'Vendor'} is ready! Someone will bring it to you.`;
                await sendSMS(order.student.phoneNumber, msg);
            }
        }

        return NextResponse.json({ success: true, status: targetStatus });

    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
