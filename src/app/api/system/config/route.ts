
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Publicly accessible system configuration check.
 * Used to block UI features during maintenance.
 */
export async function GET() {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: 'GLOBAL_CONFIG' }
        });

        // Default to safe values if not found
        return NextResponse.json({
            success: true,
            maintenanceMode: config?.maintenanceMode ?? false,
            deliveryFee: config?.deliveryFee ?? 5.0,
            platformFee: config?.platformFee ?? 2.0
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            maintenanceMode: false,
            deliveryFee: 5.0,
            platformFee: 2.0
        });
    }
}
