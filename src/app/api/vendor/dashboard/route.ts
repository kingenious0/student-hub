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

        // Debug logging
        console.log(`[VendorDashboard] Fetching for ClerkID: ${userId}, VendorID: ${vendor.id}`);

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        // Calculate date 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        // Fetch stats
        const [totalProducts, orders, activeFlashSales, revenueOrders] = await Promise.all([
            // Total products
            prisma.product.count({
                where: { vendorId: vendor.id }
            }),

            // Recent orders (for list)
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
                take: 5 // Changed from 10 to 5 to match UI
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
            }),

            // Revenue Data for Chart (Last 6 months)
            prisma.order.findMany({
                where: {
                    vendorId: vendor.id,
                    status: 'COMPLETED',
                    createdAt: { gte: sixMonthsAgo }
                },
                select: {
                    amount: true,
                    createdAt: true
                }
            })
        ]);

        const totalOrders = await prisma.order.count({ where: { vendorId: vendor.id } }); // Get real total count
        const pendingOrders = await prisma.order.count({ where: { vendorId: vendor.id, status: 'PENDING' } });

        // Calculate total earnings (all time)
        // Note: For large scale, you'd aggregate this in DB. For now, aggregating strictly completed orders is fine.
        const allCompletedOrders = await prisma.order.aggregate({
            where: { vendorId: vendor.id, status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const totalEarnings = allCompletedOrders._sum.amount || 0;

        // Process Graph Data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueMap = new Map<string, number>();

        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = monthNames[d.getMonth()];
            revenueMap.set(monthName, 0);
        }

        revenueOrders.forEach(order => {
            const monthName = monthNames[new Date(order.createdAt).getMonth()];
            if (revenueMap.has(monthName)) {
                revenueMap.set(monthName, (revenueMap.get(monthName) || 0) + order.amount);
            }
        });

        const monthlyRevenue = Array.from(revenueMap).map(([name, total]) => ({ name, total }));

        return NextResponse.json({
            stats: {
                totalProducts,
                totalOrders,
                totalEarnings,
                pendingOrders,
                activeFlashSales,
            },
            monthlyRevenue,
            recentOrders: orders
        });

    } catch (error) {
        console.error('Vendor dashboard error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
