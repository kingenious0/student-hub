import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch all flash sales
export async function GET(req: NextRequest) {
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

        // Fetch all flash sales with product details
        const flashSales = await prisma.flashSale.findMany({
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ flashSales });
    } catch (error) {
        console.error('Error fetching flash sales:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new flash sale
export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const { name, productId, discountPercent, stockLimit, startTime, endTime } = body;

        // Validate required fields
        if (!name || !productId || !discountPercent || !stockLimit || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get product details
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { price: true },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Calculate sale price
        const originalPrice = product.price;
        const salePrice = originalPrice * (1 - discountPercent / 100);

        // Create or update flash sale
        const flashSale = await prisma.flashSale.upsert({
            where: { productId },
            update: {
                name,
                originalPrice,
                salePrice,
                discountPercent,
                stockLimit,
                stockSold: 0, // Reset sold count
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isActive: true,
            },
            create: {
                name,
                productId,
                originalPrice,
                salePrice,
                discountPercent,
                stockLimit,
                stockSold: 0,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isActive: true,
            },
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

        return NextResponse.json({ flashSale }, { status: 201 });
    } catch (error) {
        console.error('Error creating flash sale:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
