
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        if (!q || q.trim().length < 1) {
            return NextResponse.json({ products: [], vendors: [], categories: [] });
        }

        const query = q.trim();

        // Tokenize query for "Google-like" AND logic (e.g. "hand sanitizer" -> contains "hand" AND "sanitizer")
        const terms = query.split(/\s+/).filter(t => t.length > 0);

        const searchConditions = terms.map(term => ({
            OR: [
                { title: { contains: term, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: term, mode: Prisma.QueryMode.insensitive } },
            ]
        }));

        // Run searches in parallel
        const [products, vendors, categories] = await Promise.all([
            // 1. Search Products
            prisma.product.findMany({
                where: {
                    AND: [
                        ...searchConditions,
                    ]
                },
                take: 6,
                select: {
                    id: true,
                    title: true,
                    price: true,
                    imageUrl: true,
                    vendor: {
                        select: { shopName: true }
                    }
                }
            }),

            // 2. Search Vendors
            prisma.user.findMany({
                where: {
                    shopName: { contains: query, mode: Prisma.QueryMode.insensitive },
                    vendorStatus: { not: 'NOT_APPLICABLE' }
                },
                take: 3,
                select: {
                    id: true,
                    shopName: true,
                    vendorStatus: true
                }
            }),

            // 3. Search Categories
            prisma.category.findMany({
                where: {
                    name: { contains: query, mode: Prisma.QueryMode.insensitive }
                },
                take: 3,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    icon: true
                }
            })
        ]);

        return NextResponse.json({ products, vendors, categories });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
