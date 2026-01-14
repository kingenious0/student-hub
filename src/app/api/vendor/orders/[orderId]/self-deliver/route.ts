import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> } // Params is Promise in Next 15
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await params;

        // Verify Vendor Ownership & Order Status
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { vendor: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Vendor must be the authenticated user (via Clerk ID mapping)
        // Note: prisma schema User has clerkId. auth().userId is clerkId.
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user || order.vendorId !== user.id) {
            return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 });
        }

        if (order.status !== 'READY') {
            // Allow PREPARING too? Ideally only READY.
            return NextResponse.json({ error: 'Order must be READY to self-deliver' }, { status: 400 });
        }

        if (order.runnerId) {
            return NextResponse.json({ error: 'Order already has a runner' }, { status: 400 });
        }

        // Execute Self-Delivery Assignment
        // 1. Assign Vendor as Runner
        // 2. Set Status to PICKED_UP (skipping assignment flow)
        // 3. Ensure Mission created? (Optional but good for data)

        await prisma.$transaction(async (tx) => {
            // Update Order
            await tx.order.update({
                where: { id: orderId },
                data: {
                    runnerId: user.id,
                    status: 'PICKED_UP',
                    // pickupCode is used for Runner-Vendor handshake.
                    // Since Vendor IS Runner, we can clear it or consider it auto-verified.
                    // We'll leave it, but Vendor won't need to ask themselves for it.
                    pickedUpAt: new Date(),
                }
            });

            // Create/Update Mission
            // If mission exists, update it. If not, create.
            // Usually Mission is created when Runner accepts.
            await tx.mission.upsert({
                where: { orderId: orderId },
                create: {
                    orderId: orderId,
                    runnerId: user.id,
                    status: 'PICKED_UP'
                },
                update: {
                    runnerId: user.id,
                    status: 'PICKED_UP'
                }
            });
        });

        return NextResponse.json({ success: true, message: 'Self-delivery activated' });

    } catch (error) {
        console.error('Self-delivery Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
