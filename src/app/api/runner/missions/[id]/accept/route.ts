
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { createTrip } from '@/lib/location/radar-server';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const { id } = await context.params; // Order/Mission ID

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const runner = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!runner || !runner.isRunner) {
            return NextResponse.json({ error: 'Only verified Runners can accept missions.' }, { status: 403 });
        }

        // --- THE RACE CONDITION LOCK ---
        // We use a transaction or specific update clause to ensure ATOMICITY
        // "Update the order globally setting runnerId = ME, ONLY IF runnerId is currently NULL"

        // Generate 6-digit Pickup Code (Runner Key)
        const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();

        const result = await prisma.order.updateMany({
            where: {
                id: id,
                runnerId: null, // CRITICAL: This ensures it hasn't been taken yet
                fulfillmentType: 'DELIVERY'
            },
            data: {
                runnerId: runner.id,
                pickupCode: pickupCode,
                // Status remains 'READY' (or whatever it was) until Vendor verifies pickup
                // But effectively it is now "ASSIGNED" because runnerId is set
            }
        });

        if (result.count === 0) {
            // If count is 0, it means the WHERE clause failed.
            // Either the order doesn't exist OR (more likely) runnerId was NOT null.
            return NextResponse.json(
                { error: 'Mission already taken by another runner! Too slow!' },
                { status: 409 } // 409 Conflict
            );
        }

        // --- RADAR TRIP ACTIVATION ---
        // Fetch order details to know the destination (Vendor)
        const activeOrder = await prisma.order.findUnique({
            where: { id },
            select: { vendorId: true, id: true }
        });

        if (activeOrder) {
            try {
                // Start tracking the trip to the vendor
                await createTrip({
                    externalId: activeOrder.id,
                    destinationGeofenceTag: 'vendor', // We tagged vendors as 'vendor'
                    destinationGeofenceExternalId: activeOrder.vendorId,
                    userId: userId,
                    mode: 'motorbike'
                });
                console.log('Radar Trip started for order:', activeOrder.id);
            } catch (tripError) {
                console.error('Failed to start Radar trip:', tripError);
            }
        }

        return NextResponse.json({ success: true, message: 'Mission Secured! Go go go!' });

    } catch (error) {
        console.error('Accept mission error:', error);
        return NextResponse.json(
            { error: 'System Malfunction' },
            { status: 500 }
        );
    }
}
