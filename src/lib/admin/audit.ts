
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * Audit Logger for Admin Actions.
 * Stores a permanent record of what changed and who did it.
 */
export async function logAdminAction(action: string, details?: unknown) {
    try {
        const { userId } = await auth();
        if (!userId) return;

        await prisma.adminLog.create({
            data: {
                adminId: userId,
                action,
                details: details ? JSON.stringify(details) : null,
            }
        });

        console.log(`[AUDIT] Admin ${userId} performed: ${action}`);
    } catch (error) {
        console.error('[AUDIT] Failed to record admin action:', error);
    }
}
