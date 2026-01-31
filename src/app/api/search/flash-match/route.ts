// src/app/api/search/flash-match/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sortByFlashMatch, isVendorActive } from '@/lib/geo/distance';

/**
 * Flash-Match search algorithm
 * Finds products based on proximity and vendor availability
 */

// export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const userHotspot = searchParams.get('hotspot');
        const category = searchParams.get('category');
        const maxInactiveMinutes = parseInt(searchParams.get('maxInactive') || '10');

        // Build search filters
        const where: Record<string, unknown> = {};

        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ];
        }

        if (category) {
            where.categoryId = category;
        }

        // Fetch products with vendor info
        const products = await prisma.product.findMany({
            where,
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        lastActive: true,
                        currentHotspot: true,
                        role: true,
                    },
                },
                category: true,
            },
            take: Math.min(parseInt(searchParams.get('take') || '50'), 200), // Dynamic limit with safety cap
        });

        // Define type for products with vendor relations BEFORE sorting
        type ProductWithVendor = typeof products[number];

        // Apply Flash-Match algorithm (cast to maintain type)
        const sortedProducts = sortByFlashMatch(
            products,
            userHotspot,
            maxInactiveMinutes
        ) as ProductWithVendor[];

        // Add metadata to results
        const results = sortedProducts.map((product: ProductWithVendor) => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            hotspot: product.hotspot,
            vendor: {
                id: product.vendor.id,
                name: product.vendor.name,
                isActive: isVendorActive(product.vendor.lastActive, maxInactiveMinutes),
                lastActive: product.vendor.lastActive,
                currentHotspot: product.vendor.currentHotspot,
            },
            createdAt: product.createdAt,
        }));;

        return NextResponse.json({
            success: true,
            query,
            userHotspot,
            results,
            count: results.length,
            algorithm: 'flash-match',
        });
    } catch (error) {
        console.error('Flash-Match search error:', error);
        return NextResponse.json(
            {
                error: 'Search failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

