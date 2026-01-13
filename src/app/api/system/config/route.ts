
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Publicly accessible system configuration check.
 * Used to block UI features during maintenance.
 */

// export const runtime = 'edge';

export async function GET() {
    try {
        const config = await prisma.systemSettings.findUnique({
            where: { id: 'GLOBAL_CONFIG' }
        });

        // Default to safe values if not found
        return NextResponse.json({
            success: true,
            maintenanceMode: config?.maintenanceMode ?? false,
            activeFeatures: config?.activeFeatures ?? ['MARKET', 'PULSE', 'RUNNER', 'ESCROW'],
            globalNotice: config?.globalNotice ?? null,
            contentOverride: config?.contentOverride ?? {}
        });
    } catch (error) {
        console.error('System config fetch error:', error);
        return NextResponse.json({
            success: false,
            maintenanceMode: false,
            activeFeatures: ['MARKET', 'PULSE', 'RUNNER', 'ESCROW'],
            globalNotice: null
        });
    }
}

import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'GOD_MODE')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { updateKey, updateValue } = body;

    if (updateKey && typeof updateValue === 'string') {
        const current = await prisma.systemSettings.findUnique({ where: { id: 'GLOBAL_CONFIG' } });
        const currentOverrides = (current?.contentOverride as Record<string, string>) || {};

        const newOverrides = { ...currentOverrides, [updateKey]: updateValue };

        await prisma.systemSettings.upsert({
            where: { id: 'GLOBAL_CONFIG' },
            create: { contentOverride: newOverrides, maintenanceMode: false },
            update: { contentOverride: newOverrides }
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
