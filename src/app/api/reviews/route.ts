import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, rating, comment } = await request.json();

        if (!productId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid input. Rating must be 1-5.' }, { status: 400 });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const existing = await prisma.review.findFirst({
            where: { productId, userId: user.id }
        });
        if (existing) {
            return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
        }

        const completedOrderItem = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    studentId: user.id,
                    status: 'COMPLETED'
                }
            }
        });
        const verifiedPurchase = !!completedOrderItem;

        const review = await prisma.review.create({
            data: {
                productId,
                userId: user.id,
                userName: user.name || user.email.split('@')[0] || 'Anonymous',
                rating,
                comment: comment || null,
                verifiedPurchase
            }
        });

        const agg = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: true
        });

        await prisma.product.update({
            where: { id: productId },
            data: {
                averageRating: agg._avg.rating || 0,
                totalReviews: agg._count
            }
        });

        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}
