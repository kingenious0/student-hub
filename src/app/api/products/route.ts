
/**
 * Products API
 * GET /api/products?q=search&category=cat&minPrice=0&maxPrice=1000&sort=relevance&page=1
 * POST /api/products - Create new product (vendor only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserExists } from '@/lib/auth/sync';
import { validateData, productCreateSchema } from '@/lib/security/validation';
import { searchProducts, type SearchQuery } from '@/lib/utils/search';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const q = searchParams.get('q')?.trim() || undefined;
        const category = searchParams.get('category')?.trim() || undefined;

        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const inStock = searchParams.get('inStock') === 'true';

        const sortBy = (searchParams.get('sort') as SearchQuery['sortBy']) || 'relevance';
        const page = Math.max(1, Number(searchParams.get('page') || 1));
        const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)));

        const query: SearchQuery = {
            q,
            category,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            sortBy,
            page,
            pageSize,
        };

        const andFilters: any[] = [];

        if (q) {
            andFilters.push({
                OR: [
                    { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
                    { category: { name: { contains: q, mode: Prisma.QueryMode.insensitive } } },
                ],
            });
        }

        if (category) {
            andFilters.push({
                OR: [
                    { categoryId: category },
                    { category: { slug: category } },
                    { category: { name: { equals: category, mode: Prisma.QueryMode.insensitive } } },
                ],
            });
        }

        if (minPrice || maxPrice) {
            andFilters.push({
                price: {
                    gte: minPrice ? Number(minPrice) : undefined,
                    lte: maxPrice ? Number(maxPrice) : undefined,
                },
            });
        }

        if (inStock) {
            andFilters.push({ isInStock: true });
        }

        const where = andFilters.length ? { AND: andFilters } : {};

        const include = {
            vendor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    currentHotspot: true,
                    lastActive: true,
                    isAcceptingOrders: true,
                    shopName: true,
                },
            },
            category: true,
        };

        if (sortBy === 'relevance' && q) {
            const products = await prisma.product.findMany({ where, include });
            const mapped = products.map(product => ({
                ...product,
                rating: product.averageRating ?? 0,
            }));

            const result = searchProducts(mapped, query);
            return NextResponse.json({
                success: true,
                products: result.items,
                pagination: {
                    page: result.page,
                    pageSize: result.pageSize,
                    total: result.total,
                    hasMore: result.hasMore,
                },
            });
        }

        const orderByMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
            'price-asc': { price: 'asc' },
            'price-desc': { price: 'desc' },
            'popular': { salesCount: 'desc' },
            'rating': { averageRating: 'desc' },
            'newest': { createdAt: 'desc' },
        };

        const orderBy = orderByMap[sortBy] || { createdAt: 'desc' };

        const [total, products] = await prisma.$transaction([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                include,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return NextResponse.json({
            success: true,
            products,
            pagination: {
                page,
                pageSize,
                total,
                hasMore: page * pageSize < total,
            },
        });
    } catch (error) {
        console.error('Products fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await ensureUserExists();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                role: true,
                vendorStatus: true,
                shopLandmark: true,
                banned: true,
                walletFrozen: true,
            },
        });

        if (!dbUser || dbUser.banned || dbUser.walletFrozen) {
            return NextResponse.json({ error: 'Account restricted' }, { status: 403 });
        }

        const isVendor = dbUser.role === 'VENDOR' || dbUser.role === 'ADMIN' || dbUser.role === 'GOD_MODE';
        if (!isVendor) {
            return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
        }

        if (dbUser.role === 'VENDOR' && dbUser.vendorStatus !== 'ACTIVE') {
            return NextResponse.json({ error: 'Vendor not approved' }, { status: 403 });
        }

        const body = await request.json();
        const normalized = {
            ...body,
            price: Number(body.price),
            stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : undefined,
            images: Array.isArray(body.images)
                ? body.images
                : body.imageUrl
                    ? [body.imageUrl]
                    : [],
        };

        const validation = validateData(productCreateSchema, normalized);
        if (!validation.success || !validation.data) {
            return NextResponse.json({ error: validation.error || 'Invalid input' }, { status: 400 });
        }

        const { title, description, price, categoryId, hotspot, stockQuantity, images, details } = validation.data;
        const imageUrl = images?.[0] || body.imageUrl || null;

        const product = await prisma.product.create({
            data: {
                title,
                description,
                price,
                categoryId,
                hotspot: hotspot || dbUser.shopLandmark || null,
                stockQuantity: stockQuantity ?? 0,
                isInStock: (stockQuantity ?? 0) > 0,
                images,
                imageUrl,
                details: details ? (details as Prisma.InputJsonValue) : undefined,
                vendorId: dbUser.id,
            },
            include: {
                vendor: {
                    select: {
                        name: true,
                        email: true,
                        shopName: true,
                    },
                },
                category: true,
            },
        });

        revalidateTag('products');

        return NextResponse.json({ success: true, product }, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
