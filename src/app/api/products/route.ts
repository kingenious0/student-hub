
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserExists } from '@/lib/auth/sync';
import { getCachedProductsByCategory } from '@/lib/db/cached-queries';
import { revalidateTag } from 'next/cache';

// GET - List all products or vendor's products

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorOnly = searchParams.get('vendorOnly') === 'true';
        const query = searchParams.get('q');
        const categoryId = searchParams.get('categoryId');

        const { userId } = await auth();

        let where: any = {};

        if (vendorOnly && userId) {
            const user = await prisma.user.findUnique({
                where: { clerkId: userId },
            });

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            where.vendorId = user.id;
        }

        if (query) {
            // Tokenize query for "Google-like" AND logic
            const terms = query.split(/\s+/).filter(t => t.length > 0);

            const searchConditions = terms.map(term => ({
                OR: [
                    { title: { contains: term, mode: 'insensitive' } },
                    { description: { contains: term, mode: 'insensitive' } },
                ]
            }));

            where.AND = searchConditions;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const university = searchParams.get('university');
        if (university) {
            where.vendor = {
                university: university
            };
        }

        if (categoryId && !query && !vendorOnly) {
            const products = await getCachedProductsByCategory(categoryId);
            return NextResponse.json({ success: true, products });
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        currentHotspot: true,
                        lastActive: true,
                    },
                },
                category: true, // Include category info
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await ensureUserExists();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized or User not found' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, price, categoryId, imageUrl, hotspot, details } = body;

        // Validation
        if (!title || !description || !price || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const validUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, shopLandmark: true }
        });

        const finalHotspot = hotspot || validUser?.shopLandmark || 'Campus Canteen';

        const product = await prisma.product.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                categoryId,
                imageUrl,
                hotspot: finalHotspot,
                details,
                vendorId: user.id,
            },
            include: {
                vendor: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Cache Invalidation
        revalidateTag('products');

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
