import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch single product
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
                id: id,
                vendorId: vendor.id
            },
            include: {
                category: true,
                modifierGroups: {
                    include: { modifiers: true },
                    orderBy: { name: 'asc' },
                },
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
        const { title, description, price, categoryId, imageUrl, stockQuantity, isReadyMade, details, images, modifierGroups } = body;

        const hasModifiers = modifierGroups?.length > 0;

        // Use transaction to update product + replace modifier groups
        await prisma.$transaction(async (tx) => {
            await tx.product.updateMany({
                where: { id, vendorId: vendor.id },
                data: {
                    ...(title && { title }),
                    ...(description !== undefined && { description }),
                    ...(price !== undefined && { price: Math.round(Number(price) * 100) / 100 }),
                    ...(categoryId && { categoryId }),
                    ...(imageUrl !== undefined && { imageUrl }),
                    ...(images !== undefined && { images }),
                    ...(details !== undefined && { details }),
                    ...(isReadyMade !== undefined && { isReadyMade: Boolean(isReadyMade) }),
                    ...(stockQuantity !== undefined && {
                        stockQuantity: parseInt(stockQuantity),
                        isInStock: parseInt(stockQuantity) > 0
                    }),
                    hasModifiers,
                }
            });

            // Verify the product belongs to this vendor
            const product = await tx.product.findFirst({
                where: { id, vendorId: vendor.id },
                select: { id: true },
            });
            if (!product) throw new Error('Not found');

            // Replace modifier groups if provided
            if (modifierGroups !== undefined) {
                await tx.productModifierGroup.deleteMany({ where: { productId: id } });
                if (hasModifiers) {
                    for (const g of modifierGroups) {
                        await tx.productModifierGroup.create({
                            data: {
                                name: g.name,
                                isRequired: g.isRequired || false,
                                minSelect: g.minSelect || 0,
                                maxSelect: g.maxSelect || 1,
                                productId: id,
                                modifiers: {
                                    create: (g.modifiers || []).map((m: any) => ({
                                        name: m.name,
                                        priceDiff: Math.round(Number(m.priceDiff || 0) * 100) / 100,
                                        isDefault: m.isDefault || false,
                                    })),
                                },
                            },
                        });
                    }
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete product
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
                id: id,
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
