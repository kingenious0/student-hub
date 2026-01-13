import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// PATCH - Toggle active status
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
        const { isActive } = body;

        const flashSale = await prisma.flashSale.findFirst({
            where: {
                id: params.id,
                product: {
                    vendorId: vendor.id
                }
            }
        });

        if (!flashSale) {
            return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 });
        }

        await prisma.flashSale.update({
            where: { id: params.id },
            data: { isActive: !!isActive }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update flash sale error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete flash sale
export async function DELETE(
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

        const flashSale = await prisma.flashSale.deleteMany({
            where: {
                id: params.id,
                product: {
                    vendorId: vendor.id
                }
            }
        });

        if (flashSale.count === 0) {
            return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete flash sale error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
