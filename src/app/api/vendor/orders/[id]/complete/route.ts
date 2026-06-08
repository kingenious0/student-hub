import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import { sendSMS } from '@/lib/sms/wigal';
import { sendPushNotification } from '@/lib/notifications/push';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await props.params;
        const { id: orderId } = params;
        const { releaseKey } = await request.json();

        if (!releaseKey) {
            return NextResponse.json({ error: 'Release Key required' }, { status: 400 });
        }

        // Verify Vendor
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                student: { select: { phoneNumber: true, name: true } },
                items: {
                    include: {
                        product: { select: { title: true } }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.vendorId !== user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Verify Key
        if (order.releaseKey !== releaseKey) {
            return NextResponse.json({ error: 'Invalid Release Key' }, { status: 400 });
        }

        // Execute Completion + Credit Vendor Balance
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'COMPLETED',
                    escrowStatus: 'RELEASED',
                    releaseKey: null,
                    deliveredAt: new Date(),
                }
            });
            await tx.user.update({
                where: { id: order.vendorId },
                data: {
                    balance: { increment: order.amount }
                }
            });
        });

        // Send Notifications
        if (order.student?.phoneNumber) {
            const primaryItem = order.items?.[0];
            const itemTitle = primaryItem?.product?.title || 'Order';
            const displayTitle = order.items.length > 1 ? `${itemTitle} +${order.items.length - 1}` : itemTitle;

            await sendSMS(
                order.student.phoneNumber,
                `OMNI: Order Completed. Delivery confirmed for ${displayTitle}. Thank you for trading.`
            );
        }

        const studentPushSubs = await prisma.pushSubscription.findMany({
            where: { userId: order.studentId }
        });
        if (studentPushSubs.length > 0) {
            const primaryItem = order.items?.[0];
            const itemTitle = primaryItem?.product?.title || 'Order';
            const displayTitle = order.items.length > 1 ? `${itemTitle} +${order.items.length - 1} more` : itemTitle;
            const results = await Promise.all(
                studentPushSubs.map(sub =>
                    sendPushNotification(
                        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                        { title: '✅ Order Completed!', body: `Your order for ${displayTitle} is complete.`, url: `/orders/${order.id}/track` }
                    )
                )
            );
            const expired = results.filter(r => r.expired).map(r => r.endpoint).filter(Boolean) as string[];
            if (expired.length > 0) {
                await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: expired } } });
            }
        }

        return NextResponse.json({ success: true, message: 'Order Completed' });

    } catch (error) {
        console.error('Complete Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
