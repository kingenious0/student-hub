import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { sendOrderIssueEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms/wigal';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, details } = body;

        if (!orderId || !details) {
            return NextResponse.json({ error: 'Order ID and issue details are required' }, { status: 400 });
        }

        // Verify vendor
        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not authorized as a vendor' }, { status: 403 });
        }

        // Fetch order details
        const order = await prisma.order.findFirst({
            where: { id: orderId, vendorId: vendor.id },
            include: {
                student: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Send Email Alert to Admin
        await sendOrderIssueEmail({
            orderId: order.id,
            vendorName: vendor.shopName || vendor.name || 'Vendor',
            vendorEmail: vendor.email,
            customerName: order.student.name || 'Student',
            customerEmail: order.student.email,
            details
        });

        // Send SMS to Admin
        const adminPhone = process.env.ADMIN_SUPPORT_PHONE || '0597626090';
        if (adminPhone) {
            const smsText = `LaHustle ESCROW ISSUE: Order #${order.id.slice(0, 8).toUpperCase()} has been flagged by vendor ${vendor.shopName || vendor.name}. Check your email.`;
            await sendSMS(adminPhone, smsText);
        }

        return NextResponse.json({ success: true, message: 'Issue reported to administrator.' });

    } catch (error) {
        console.error('Report issue error:', error);
        return NextResponse.json({ error: 'Failed to report issue' }, { status: 500 });
    }
}
