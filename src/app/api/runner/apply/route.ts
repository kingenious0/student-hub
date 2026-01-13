
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Update Internal DB
        const dbUser = await prisma.user.update({
            where: { clerkId: userId },
            data: {
                isRunner: true, // Instant approval for MVP
                runnerStatus: 'OFFLINE' // Start offline
            }
        });

        // 2. Update Clerk Metadata (for frontend checks)
        const client = await clerkClient();
        await client.users.updateUser(userId, {
            publicMetadata: {
                isRunner: true,
                role: dbUser.role // Keep existing role (e.g. STUDENT) but isRunner flag is true
            }
        });

        return NextResponse.json({ success: true, user: dbUser });

    } catch (error) {
        console.error('Runner application error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
