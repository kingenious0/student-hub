import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch single product
export async function GET(
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

        const product = await prisma.product.findFirst({
            where: {
                id: params.id,
                vendorId: vendor.id
            },
            include: {
                category: true
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ product });

    } catch (error) {
        console.error('Fetch product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update product
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
        const { title, description, price, categoryId, imageUrl, stockQuantity } = body;

        const product = await prisma.product.updateMany({
            where: {
                id: params.id,
                vendorId: vendor.id
            },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(categoryId && { categoryId }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(stockQuantity !== undefined && {
                    stockQuantity: parseInt(stockQuantity),
                    isInStock: parseInt(stockQuantity) > 0
                }),
            }
        });

        if (product.count === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete product
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

        const product = await prisma.product.deleteMany({
            where: {
                id: params.id,
                vendorId: vendor.id
            }
        });

        if (product.count === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
