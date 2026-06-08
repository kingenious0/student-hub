import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const items = await prisma.wishlistItem.findMany({
            where: { userId: user.id },
            include: {
                product: {
                    include: {
                        vendor: {
                            select: {
                                id: true,
                                name: true,
                                shopName: true,
                            },
                        },
                        category: {
                            select: { name: true },
                        },
                        flashSale: {
                            where: { isActive: true },
                            select: {
                                salePrice: true,
                                originalPrice: true,
                                discountPercent: true,
                                isActive: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, items, count: items.length });
    } catch (error) {
        console.error('[/api/wishlist] GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const existing = await prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId: user.id, productId } },
        });

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already in wishlist' });
        }

        const item = await prisma.wishlistItem.create({
            data: { userId: user.id, productId },
        });

        return NextResponse.json({ success: true, item }, { status: 201 });
    } catch (error) {
        console.error('[/api/wishlist] POST error:', error);
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await prisma.wishlistItem.deleteMany({
            where: { userId: user.id, productId },
        });

        return NextResponse.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        console.error('[/api/wishlist] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}
