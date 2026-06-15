import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
        let vendorId = id;

        if (!isUuid) {
            const activeVendors = await prisma.user.findMany({
                where: { vendorStatus: 'ACTIVE' },
                select: { id: true, shopName: true }
            });
            const slugify = (text: string) => {
                return text
                    .toString()
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                    .replace(/\-\-+/g, '-');
            };
            const matched = activeVendors.find(v => v.shopName && slugify(v.shopName) === id.toLowerCase());
            if (matched) {
                vendorId = matched.id;
            }
        }

        const vendor = await prisma.user.findUnique({
            where: { id: vendorId },
            select: {
                id: true,
                name: true,
                shopName: true,
                shopLandmark: true,
                phoneNumber: true,
                vendorStatus: true,
                vendorType: true,
                isAcceptingOrders: true,
                currentHotspot: true,
                products: {
                    where: { isInStock: true },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        price: true,
                        imageUrl: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                                icon: true,
                            }
                        },
                        stockQuantity: true,
                        hotspot: true,
                        isReadyMade: true,
                        averageRating: true,
                        totalReviews: true,
                        createdAt: true,
                        flashSale: {
                            where: { isActive: true },
                            select: {
                                id: true,
                                salePrice: true,
                                startTime: true,
                                endTime: true,
                                stockSold: true,
                                stockLimit: true,
                            }
                        },
                        modifierGroups: {
                            select: {
                                id: true,
                                name: true,
                                isRequired: true,
                                modifiers: {
                                    select: {
                                        id: true,
                                        name: true,
                                        priceDiff: true,
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        if (vendor.vendorStatus !== 'ACTIVE') {
            return NextResponse.json({ error: 'Vendor not available' }, { status: 404 });
        }

        const now = new Date();
        const products = (vendor as any).products.map((p: any) => {
            const isFlashSaleActive = p.flashSale && now >= p.flashSale.startTime && now <= p.flashSale.endTime && p.flashSale.stockSold < p.flashSale.stockLimit;

            return {
                id: p.id,
                title: p.title,
                description: p.description,
                price: p.price,
                imageUrl: p.imageUrl,
                category: p.category,
                stockQuantity: p.stockQuantity || 100,
                hotspot: p.hotspot,
                isReadyMade: p.isReadyMade,
                averageRating: p.averageRating,
                totalReviews: p.totalReviews,
                isFlashSale: !!isFlashSaleActive,
                salePrice: isFlashSaleActive ? p.flashSale?.salePrice : undefined,
                discountPercent: isFlashSaleActive && p.flashSale?.salePrice
                    ? Math.round((1 - p.flashSale.salePrice / p.price) * 100)
                    : undefined,
                modifierGroups: p.modifierGroups,
            };
        });

        return NextResponse.json({
            success: true,
            vendor: {
                id: vendor.id,
                name: vendor.name,
                shopName: vendor.shopName,
                shopLandmark: vendor.shopLandmark,
                phoneNumber: vendor.phoneNumber,
                vendorType: vendor.vendorType,
                isAcceptingOrders: vendor.isAcceptingOrders,
                currentHotspot: vendor.currentHotspot,
            },
            products,
        });
    } catch (error) {
        console.error('Public vendor fetch error:', error);
        return NextResponse.json({ error: 'Failed to load vendor' }, { status: 500 });
    }
}
