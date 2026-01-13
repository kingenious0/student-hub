import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// PATCH - Update flash sale (toggle active status)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN' && user?.role !== 'GOD_MODE') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { isActive } = body;

        // Update flash sale
        const flashSale = await prisma.flashSale.update({
            where: { id },
            data: { isActive },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                    },
                },
            },
        });

        return NextResponse.json({ flashSale });
    } catch (error) {
        console.error('Error updating flash sale:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete flash sale
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN' && user?.role !== 'GOD_MODE') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Delete flash sale
        await prisma.flashSale.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting flash sale:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
