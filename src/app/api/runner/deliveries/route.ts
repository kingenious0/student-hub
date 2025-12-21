
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify user is a runner and online
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user || !user.isRunner) {
            return NextResponse.json(
                { error: 'User is not an active runner' },
                { status: 403 }
            );
        }


        // Fetch available orders
        // Status must be READY (prepared by vendor)
        // No runner assigned yet
        // TODO: In future, filter by proximity to user.currentHotspot
        const orders = await prisma.order.findMany({
            where: {
                status: 'READY',
                runnerId: null,
            },
            include: {
                product: true,
                vendor: {
                    select: {
                        name: true,
                        currentHotspot: true, // Assuming vendor location is strictly product hotspot, but fallback to vendor's current
                    }
                },
                student: {
                    select: {
                        name: true,
                        currentHotspot: true, // Delivery location
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        // Define type for orders with relations
        type OrderWithRelations = typeof orders[number];

        // Transform to friendly format for UI
        const deliveries = orders.map((order: OrderWithRelations) => {
            // Calculate mock distance/earnings if not set
            // In a real app, use Google Maps API or GeoLib with coordinates
            const pickup = order.product.hotspot || order.vendor.currentHotspot || 'Unknown Vendor Loc';
            const dropoff = order.student.currentHotspot || 'Unknown Student Loc';

            // Base fee + distance (mocked)
            // If runnerEarnings is null, estimate it (e.g., 20% of order amount or fixed fee)
            const estimatedEarnings = order.runnerEarnings || Math.max(2.00, order.amount * 0.15);

            return {
                id: order.id,
                product: {
                    title: order.product.title,
                },
                amount: order.amount,
                pickupLocation: pickup,
                deliveryLocation: dropoff,
                estimatedEarnings: estimatedEarnings,
                estimatedXP: order.runnerXpAwarded || 100, // Default 100 XP
                distance: '0.5 km', // Mock distance
                createdAt: order.createdAt,
            };
        });

        return NextResponse.json({
            success: true,
            deliveries,
        });

    } catch (error) {
        console.error('Fetch deliveries error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch deliveries' },
            { status: 500 }
        );
    }
}
