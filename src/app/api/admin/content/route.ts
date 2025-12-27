import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

// GET - Fetch all content edits
export async function GET() {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: 'GLOBAL_CONFIG' }
        });

        const contentOverride = settings?.contentOverride as Record<string, string> || {};

        return NextResponse.json({
            success: true,
            content: contentOverride
        });
    } catch (error) {
        console.error('[CONTENT-API] GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 });
    }
}

// POST - Save content edit
export async function POST(req: NextRequest) {
    try {
        const { userId, sessionClaims } = await auth();

        // Check authorization (GOD_MODE or ADMIN)
        const userRole = (sessionClaims?.metadata as any)?.role;
        if (userRole !== 'GOD_MODE' && userRole !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { id, content } = await req.json();

        if (!id || content === undefined) {
            return NextResponse.json({ success: false, error: 'Missing id or content' }, { status: 400 });
        }

        console.log(`[CONTENT-API] Saving edit: ${id} = "${content}"`);

        // Get current settings
        let settings = await prisma.systemSettings.findUnique({
            where: { id: 'GLOBAL_CONFIG' }
        });

        // Initialize if doesn't exist
        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    id: 'GLOBAL_CONFIG',
                    maintenanceMode: false,
                    activeFeatures: ['MARKET', 'PULSE', 'RUNNER', 'ESCROW', 'VENDOR'],
                    contentOverride: {}
                }
            });
        }

        // Update contentOverride
        const currentOverrides = settings.contentOverride as Record<string, string> || {};
        currentOverrides[id] = content;

        await prisma.systemSettings.update({
            where: { id: 'GLOBAL_CONFIG' },
            data: {
                contentOverride: currentOverrides
            }
        });

        // Log the action
        await prisma.adminLog.create({
            data: {
                adminId: userId || 'GHOST_ADMIN',
                action: 'EDIT_CONTENT',
                details: `Edited ${id}: "${content}"`,
            }
        });

        console.log(`[CONTENT-API] ✅ Saved successfully`);

        return NextResponse.json({
            success: true,
            content: currentOverrides
        });
    } catch (error) {
        console.error('[CONTENT-API] POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to save content' }, { status: 500 });
    }
}
