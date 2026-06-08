import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
        const skip = (page - 1) * pageSize;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { productId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
                select: {
                    id: true,
                    userName: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    verifiedPurchase: true,
                    helpfulCount: true
                }
            }),
            prisma.review.count({ where: { productId } })
        ]);

        return NextResponse.json({
            success: true,
            reviews,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('Fetch reviews error:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}
