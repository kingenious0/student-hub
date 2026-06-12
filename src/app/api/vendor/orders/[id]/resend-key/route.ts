import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { sendSMS } from '@/lib/sms';

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
                vendor: { select: { shopName: true, name: true } },
            }
        });

        if (!order || order.vendorId !== user.id) {
            return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
        }

        if (!order.releaseKey) {
            return NextResponse.json({ error: 'No release key found for this order' }, { status: 400 });
        }

        if (!order.student?.phoneNumber) {
            return NextResponse.json({ error: 'Student has no phone number on file' }, { status: 400 });
        }

        const shop = order.vendor?.shopName || order.vendor?.name || 'Vendor';
        const studentName = order.student.name || 'Student';

        await sendSMS(
            order.student.phoneNumber,
            `LaHustle PAY: Hello ${studentName}, your release key for ${shop} is: ${order.releaseKey}\nShare this only when you receive your items.`
        );

        return NextResponse.json({ success: true, message: 'Release key resent' });

    } catch (error) {
        console.error('Resend key error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
