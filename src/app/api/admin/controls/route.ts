
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';

// Get global config

// export const runtime = 'edge';

export async function GET() {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden: Insufficient clearance' }, { status: 403 });
    }

    try {
        let config = await prisma.systemSettings.findUnique({
            where: { id: 'GLOBAL_CONFIG' }
        });

        if (!config) {
            config = await prisma.systemSettings.create({
                data: { id: 'GLOBAL_CONFIG' }
            });
        }

        return NextResponse.json({ success: true, config });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

// Update global config

export async function POST(request: NextRequest) {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden: Insufficient clearance' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { deliveryFee, platformFee, maintenanceMode } = body;

        const config = await prisma.systemSettings.update({
            where: { id: 'GLOBAL_CONFIG' },
            data: {
                deliveryFee: parseFloat(deliveryFee),
                platformFee: parseFloat(platformFee),
                maintenanceMode: maintenanceMode === true
            }
        });

        // Audit Log
        await logAdminAction('SYSTEM_CONFIG_UPDATE', config);

        return NextResponse.json({ success: true, message: 'System Parameters Updated', config });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update system parameters' }, { status: 500 });
    }
}

