
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                products: true,
                vendorOrders: {
                    include: {
                        product: {
                            select: {
                                title: true,
                            },
                        },
                        student: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Calculate stats
        const totalOrders = user.vendorOrders.length;
        const pendingOrders = user.vendorOrders.filter((o) => o.status === 'PENDING').length;
        const completedOrders = user.vendorOrders.filter((o) => o.status === 'COMPLETED').length;
        const totalRevenue = user.vendorOrders
            .filter((o) => o.status === 'COMPLETED')
            .reduce((sum: number, o) => sum + o.amount, 0);
        const heldInEscrow = user.vendorOrders
            .filter((o) => o.escrowStatus === 'HELD')
            .reduce((sum: number, o) => sum + o.amount, 0);
        const totalProducts = user.products.length;

        return NextResponse.json({
            success: true,
            vendor: {
                status: user.vendorStatus,
                role: user.role,
                shopName: user.shopName,
                shopLandmark: user.shopLandmark,
            },
            stats: {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue,
                heldInEscrow,
                totalProducts,
            },
            orders: user.vendorOrders.slice(0, 10), // Return last 10 orders
        });
    } catch (error) {
        console.error('Fetch vendor stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vendor stats' },
            { status: 500 }
        );
    }
}
