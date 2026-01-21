import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { unstable_cache } from 'next/cache';

// Cache the discovery feed for 60 seconds to reduce DB load
const getDiscoveryFeed = unstable_cache(
    async () => {
        // 1. New Arrivals (Absolute Latest)
        const newArrivals = await prisma.product.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                vendor: { select: { id: true, name: true, currentHotspot: true, shopName: true } },
                category: true
            }
        });

        // 2. Trending (Ranked by Order Count)
        // If order counts are zero, it falls back to ID sort, which is fine.
        const trending = await prisma.product.findMany({
            take: 10,
            orderBy: {
                salesCount: 'desc'
            },
            include: {
                vendor: { select: { id: true, name: true, currentHotspot: true, shopName: true } },
                category: true
            }
        });

        // 3. Just For You (Simulated Personalization)
        // We pick a random category to feature as "Personalized"
        const categories = await prisma.category.findMany({ select: { id: true } });
        const randomCategory = categories.length > 0
            ? categories[Math.floor(Math.random() * categories.length)]
            : null;

        let recommended = await prisma.product.findMany({
            take: 10,
            where: randomCategory ? { categoryId: randomCategory.id } : {}, // Filter by random category
            orderBy: {
                // Randomize within the filtered category
                // Since Prisma doesn't support random sort natively easily in finding, 
                // we just take latest from that category for now, or random skip if larger dataset
                createdAt: 'desc'
            },
            include: {
                vendor: { select: { id: true, name: true, currentHotspot: true, shopName: true } },
                category: true
            }
        });

        // FALLBACK: If the random category turned out to be empty, fetch from ALL categories
        if (recommended.length === 0) {
            recommended = await prisma.product.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' }, // Just get latest
                include: {
                    vendor: { select: { id: true, name: true, currentHotspot: true, shopName: true } },
                    category: true
                }
            });
        }

        return {
            newArrivals,
            trending, // This will now show products with most orders
            recommended: recommended.sort(() => 0.5 - Math.random()) // Shuffle the specific category items
        };
    },
    ['marketplace-discovery-feed-v2'], // Bump version to clear cache
    { revalidate: 60, tags: ['products'] }
);

export async function GET() {
    try {
        const feed = await getDiscoveryFeed();

        return NextResponse.json({
            success: true,
            feed
        });
    } catch (error) {
        console.error('Discovery API Error:', error);
        return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 });
    }
}
