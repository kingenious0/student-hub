
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidateTag } from 'next/cache';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                vendor: {
                    select: {
                        name: true,
                        clerkId: true,
                        currentHotspot: true,
                        lastActive: true,
                        shopName: true,
                        vendorStatus: true
                    },
                },
                category: true,
                flashSale: {
                    where: { isActive: true },
                },
                reviews: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        userName: true,
                        createdAt: true
                    }
                }
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error('Fetch product error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Check verification
        const existing = await prisma.product.findUnique({
            where: { id },
            include: { vendor: true }
        });

        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (existing.vendor.clerkId !== userId) {
            const user = await prisma.user.findUnique({ where: { clerkId: userId } });
            if (user?.role !== 'ADMIN' && user?.role !== 'GOD_MODE') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const updated = await prisma.product.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                price: parseFloat(body.price),
                imageUrl: body.imageUrl,
                hotspot: body.hotspot,
                categoryId: body.categoryId,
            }
        });

        // CRITICAL: Invalidate Cache
        revalidateTag('products');

        return NextResponse.json({ success: true, product: updated });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;

        const existing = await prisma.product.findUnique({ where: { id }, include: { vendor: true } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (existing.vendor.clerkId !== userId) {
            const user = await prisma.user.findUnique({ where: { clerkId: userId } });
            if (user?.role !== 'ADMIN' && user?.role !== 'GOD_MODE') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        await prisma.product.delete({ where: { id } });

        // CRITICAL: Invalidate Cache
        revalidateTag('products');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
