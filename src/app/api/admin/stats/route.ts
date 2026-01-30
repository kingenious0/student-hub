
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

import { isAuthorizedAdmin } from '@/lib/auth/admin';

export async function GET() {
    try {
        if (!await isAuthorizedAdmin()) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // System Wide Stats
        const [
            totalOrders,
            totalRevenue,
            totalUsers,
            totalVendors,
            pendingVendors,
            recentOrders,
            recentLogs
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            prisma.user.count(),
            prisma.user.count({ where: { role: 'VENDOR' } }),
            prisma.user.count({ where: { vendorStatus: 'PENDING' } }),
            prisma.order.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: true,
                    student: true,
                    vendor: true
                }
            }),
            prisma.adminLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
            })
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders,
                totalRevenue: totalRevenue._sum.amount || 0,
                totalUsers,
                totalVendors,
                pendingVendors
            },
            recentOrders,
            recentLogs
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
    }
}

