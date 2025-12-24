// src/app/api/products/new-releases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/products/new-releases
 * 
 * Returns products created within the last 3 days (72 hours)
 * These are the "freshest" items on the marketplace
 */
export async function GET(request: NextRequest) {
    try {
        // Calculate the date 3 days ago
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const newReleases = await prisma.product.findMany({
            where: {
                createdAt: {
                    gte: threeDaysAgo // Only get items created >= 72 hours ago
                }
            },
            include: {
                vendor: true,
                category: true,
            },
            orderBy: {
                createdAt: 'desc' // Newest items first
            },
            take: 12 // Show top 12 freshest items
        });

        // Calculate "time ago" for each product
        const productsWithTimeAgo = newReleases.map(product => {
            const now = new Date();
            const createdAt = new Date(product.createdAt);
            const diffMs = now.getTime() - createdAt.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);

            let timeAgo = '';
            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                timeAgo = `${diffMinutes}m ago`;
            } else if (diffHours < 24) {
                timeAgo = `${diffHours}h ago`;
            } else if (diffDays === 1) {
                timeAgo = 'Yesterday';
            } else {
                timeAgo = `${diffDays}d ago`;
            }

            // Check if vendor is active (last active within 15 minutes)
            const isVendorActive = product.vendor.isAcceptingOrders &&
                product.vendor.lastActive &&
                (new Date().getTime() - new Date(product.vendor.lastActive).getTime()) < 15 * 60 * 1000;

            return {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                hotspot: product.hotspot,
                createdAt: product.createdAt,
                category: {
                    id: product.category.id,
                    name: product.category.name,
                    slug: product.category.slug,
                    icon: product.category.icon,
                },
                vendor: {
                    id: product.vendor.id,
                    name: product.vendor.name,
                    shopName: product.vendor.shopName,
                    currentHotspot: product.vendor.currentHotspot,
                    isAcceptingOrders: product.vendor.isAcceptingOrders,
                },
                timeAgo,
                isVendorActive
            };
        });

        return NextResponse.json({
            success: true,
            count: productsWithTimeAgo.length,
            products: productsWithTimeAgo
        });
    } catch (error) {
        console.error('Get new releases error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch new releases' },
            { status: 500 }
        );
    }
}
