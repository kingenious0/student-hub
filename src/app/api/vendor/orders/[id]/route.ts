import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { sendSMS } from '@/lib/sms/wigal';

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
                product: { select: { title: true } }
            }
        });

        if (!order || order.vendorId !== vendor.id) {
            return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
        }

        // Update
        await prisma.order.update({
            where: { id: params.id },
            data: { status: status || 'READY' }
        });

        // Notification Logic
        if (status === 'READY') {
            if (order.student.phoneNumber) {
                // SMS: "OMNI: Your order [Item] is READY at [Shop]. Assigning runner..."
                const msg = `OMNI: Your order for ${order.product.title} is marked READY at ${vendor.shopName || 'Vendor'}. Runners are being notified.`;
                await sendSMS(order.student.phoneNumber, msg);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
