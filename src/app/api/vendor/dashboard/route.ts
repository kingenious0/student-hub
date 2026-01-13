import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get vendor user
        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                id: true,
                role: true,
                vendorStatus: true,
                balance: true
            }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        // Fetch stats
        const [totalProducts, orders, activeFlashSales] = await Promise.all([
            // Total products
            prisma.product.count({
                where: { vendorId: vendor.id }
            }),

            // All orders
            prisma.order.findMany({
                where: { vendorId: vendor.id },
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    createdAt: true,
                    product: {
                        select: {
                            title: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),

            // Active flash sales
            prisma.flashSale.count({
                where: {
                    product: {
                        vendorId: vendor.id
                    },
                    isActive: true,
                    endTime: {
                        gte: new Date()
                    }
                }
            })
        ]);

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        const completedOrders = orders.filter(o => o.status === 'COMPLETED');
        const totalEarnings = completedOrders.reduce((sum, o) => sum + o.amount, 0);

        return NextResponse.json({
            stats: {
                totalProducts,
                totalOrders,
                totalEarnings,
                pendingOrders,
                activeFlashSales,
            },
            recentOrders: orders.slice(0, 5)
        });

    } catch (error) {
        console.error('Vendor dashboard error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
