import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import { sendSMS } from '@/lib/sms/wigal';

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
                product: { select: { title: true } }
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

        // Execute Completion
        await prisma.$transaction(async (tx) => {
            // Update Order
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'COMPLETED',
                    escrowStatus: 'RELEASED',
                }
            });

            // Update Mission if exists
            const mission = await tx.mission.findUnique({
                where: { orderId: orderId }
            });

            if (mission) {
                await tx.mission.update({
                    where: { orderId: orderId },
                    data: { status: 'COMPLETED' }
                });
            }
        });

        // Send Notification
        if (order.student?.phoneNumber) {
            await sendSMS(
                order.student.phoneNumber,
                `OMNI: Order Completed. Delivery confirmed for ${order.product.title}. Thank you for trading.`
            );
        }

        return NextResponse.json({ success: true, message: 'Order Completed' });

    } catch (error) {
        console.error('Complete Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
