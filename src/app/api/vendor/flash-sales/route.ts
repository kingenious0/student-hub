import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch vendor's flash sales
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        const flashSales = await prisma.flashSale.findMany({
            where: {
                product: {
                    vendorId: vendor.id
                }
            },
            include: {
                product: {
                    select: {
                        title: true,
                        price: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ flashSales });

    } catch (error) {
        console.error('Fetch flash sales error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create flash sale
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        const body = await req.json();
        const { name, productId, discountPercent, stockLimit, startTime, endTime } = body;

        // Verify product belongs to vendor
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                vendorId: vendor.id
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Calculate prices
        const originalPrice = product.price;
        const discountDec = parseInt(discountPercent) / 100;
        const salePrice = originalPrice - (originalPrice * discountDec);

        // Create or update flash sale
        const flashSale = await prisma.flashSale.upsert({
            where: { productId },
            update: {
                name,
                discountPercent: parseInt(discountPercent),
                originalPrice,
                salePrice,
                stockLimit: parseInt(stockLimit),
                stockSold: 0, // Reset sold count on update
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isActive: true,
            },
            create: {
                name,
                productId,
                discountPercent: parseInt(discountPercent),
                originalPrice,
                salePrice,
                stockLimit: parseInt(stockLimit),
                stockSold: 0,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isActive: true,
            }
        });

        return NextResponse.json({ success: true, flashSale });

    } catch (error) {
        console.error('Create flash sale error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
