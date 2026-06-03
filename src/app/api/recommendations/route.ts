
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const type = searchParams.get('type') || 'category';
        const limit = Math.min(Number(searchParams.get('limit')) || 8, 20);

        if (!productId) {
            return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { categoryId: true, vendorId: true, title: true },
        });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        let recommendations;

        if (type === 'vendor') {
            recommendations = await prisma.product.findMany({
                where: {
                    vendorId: product.vendorId,
                    id: { not: productId },
                    isInStock: true,
                },
                take: limit,
                orderBy: { salesCount: 'desc' },
                include: {
                    category: { select: { name: true, icon: true } },
                    vendor: { select: { name: true, currentHotspot: true } },
                    flashSale: { where: { isActive: true } },
                },
            });
        } else if (type === 'bought-together') {
            const orderItems = await prisma.orderItem.findMany({
                where: { productId },
                select: { orderId: true },
                take: 50,
                orderBy: { createdAt: 'desc' },
            });

            const orderIds = orderItems.map((oi) => oi.orderId);

            const siblingItems = await prisma.orderItem.findMany({
                where: {
                    orderId: { in: orderIds },
                    productId: { not: productId, notIn: [productId] },
                },
                select: {
                    productId: true,
                    _count: { select: { order: true } },
                },
            });

            const productCounts = new Map<string, number>();
            for (const item of siblingItems) {
                productCounts.set(item.productId, (productCounts.get(item.productId) || 0) + 1);
            }

            const sortedIds = [...productCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([id]) => id);

            if (sortedIds.length === 0) {
                recommendations = await prisma.product.findMany({
                    where: {
                        categoryId: product.categoryId,
                        id: { not: productId },
                        isInStock: true,
                    },
                    take: limit,
                    orderBy: { salesCount: 'desc' },
                    include: {
                        category: { select: { name: true, icon: true } },
                        vendor: { select: { name: true, currentHotspot: true } },
                        flashSale: { where: { isActive: true } },
                    },
                });
            } else {
                const products = await prisma.product.findMany({
                    where: { id: { in: sortedIds }, isInStock: true },
                    include: {
                        category: { select: { name: true, icon: true } },
                        vendor: { select: { name: true, currentHotspot: true } },
                        flashSale: { where: { isActive: true } },
                    },
                });

                const productMap = new Map(products.map((p) => [p.id, p]));
                recommendations = sortedIds.map((id) => productMap.get(id)).filter(Boolean);
            }
        } else {
            recommendations = await prisma.product.findMany({
                where: {
                    categoryId: product.categoryId,
                    id: { not: productId },
                    isInStock: true,
                },
                take: limit,
                orderBy: { salesCount: 'desc' },
                include: {
                    category: { select: { name: true, icon: true } },
                    vendor: { select: { name: true, currentHotspot: true } },
                    flashSale: { where: { isActive: true } },
                },
            });
        }

        return NextResponse.json({ success: true, recommendations });
    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
