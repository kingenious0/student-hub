import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch all vendor's products
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get vendor
        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        // Fetch products
        const products = await prisma.product.findMany({
            where: { vendorId: vendor.id },
            include: {
                category: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ products });

    } catch (error) {
        console.error('Fetch products error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get vendor
        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, price, categoryId, imageUrl, stockQuantity } = body;

        // Validate
        if (!title || !price || !categoryId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                title,
                description: description || '',
                price: parseFloat(price),
                categoryId,
                vendorId: vendor.id,
                imageUrl: imageUrl || null,
                stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
                isInStock: stockQuantity ? parseInt(stockQuantity) > 0 : false,
            }
        });

        return NextResponse.json({ success: true, product });

    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
