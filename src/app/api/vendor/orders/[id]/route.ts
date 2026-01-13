import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const body = await req.json();
        const { status } = body;

        const order = await prisma.order.updateMany({
            where: {
                id: params.id,
                vendorId: vendor.id
            },
            data: {
                status: status || 'READY_FOR_PICKUP'
            }
        });

        if (order.count === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
