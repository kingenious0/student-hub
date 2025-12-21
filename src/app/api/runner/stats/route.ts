import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

/**
 * Get runner statistics (earnings, completed deliveries, etc.)
 */
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
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Fetch all completed deliveries for this runner
        const completedDeliveries = await prisma.order.findMany({
            where: {
                runnerId: user.id,
                status: 'COMPLETED',
            },
            include: {
                product: {
                    select: {
                        title: true,
                    }
                }
            },
            orderBy: {
                deliveredAt: 'desc',
            },
            take: 10, // Just the recent 10 for the "bin"
        });

        // Calculate totals
        const totalEarnings = completedDeliveries.reduce(
            (sum: number, order) => sum + (order.runnerEarnings || 0),
            0
        );

        const totalXPEarned = completedDeliveries.reduce(
            (sum: number, order) => sum + (order.runnerXpAwarded || 0),
            0
        );

        const completedCount = completedDeliveries.length;

        // Get active delivery (if any)
        const activeDelivery = await prisma.order.findFirst({
            where: {
                runnerId: user.id,
                status: 'PICKED_UP',
            },
            include: {
                product: true,
                student: {
                    select: {
                        name: true,
                        currentHotspot: true,
                    }
                },
                vendor: {
                    select: {
                        name: true,
                        currentHotspot: true,
                    }
                }
            },
        });

        // Calculate badges (simple implementation)
        const badges: string[] = [];
        if (completedCount >= 1) badges.push('🎯 First Delivery');
        if (completedCount >= 10) badges.push('⭐ 10 Deliveries');
        if (completedCount >= 50) badges.push('🔥 50 Deliveries');
        if (completedCount >= 100) badges.push('💎 Century Club');
        if (user.runnerLevel >= 5) badges.push('🏆 Level 5');
        if (user.runnerLevel >= 10) badges.push('👑 Level 10');

        return NextResponse.json({
            stats: {
                xp: user.xp,
                level: user.runnerLevel,
                totalEarnings,
                completedDeliveries: completedCount,
                badges,
                isOnline: user.isRunner && user.runnerStatus === 'IDLE',
                status: user.runnerStatus,
            },
            activeDelivery: activeDelivery ? {
                id: activeDelivery.id,
                product: activeDelivery.product.title,
                pickupLocation: activeDelivery.product.hotspot || activeDelivery.vendor.currentHotspot,
                deliveryLocation: activeDelivery.student.currentHotspot,
                earnings: activeDelivery.runnerEarnings,
                xp: activeDelivery.runnerXpAwarded,
            } : null,
            history: completedDeliveries.map((d) => ({
                id: d.id,
                product: d.product.title,
                earnings: d.runnerEarnings,
                xp: d.runnerXpAwarded,
                date: d.deliveredAt,
            }))
        });

    } catch (error) {
        console.error('Fetch runner stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch runner stats' },
            { status: 500 }
        );
    }
}
