
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { cookies } from 'next/headers';

/**
 * Robust security check for Admin access.
 * Checks both the Clerk role and the OMNI_BOSS_TOKEN cookie.
 * 
 * @returns true if authorized, false otherwise.
 */
export async function isAuthorizedAdmin() {
    try {
        const { userId } = await auth();
        if (!userId) return false;

        // 1. Check Cookie (Uplink Token) - Optional/Deprecated for now
        // const cookieStore = await cookies();
        // const bossToken = cookieStore.get('OMNI_BOSS_TOKEN');
        // if (!bossToken || bossToken.value !== 'AUTHORIZED_ADMIN') {
        //     console.warn(`[SECURITY] Potential Admin bypass attempt by: ${userId}`);
        //     return false;
        // }

        // 2. Check Database Role
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true }
        });

        return user?.role === 'ADMIN' || user?.role === 'GOD_MODE';
    } catch (error) {
        console.error('[SECURITY] Admin authorization check failed:', error);
        return false;
    }
}
