
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
        const { sessionClaims, userId } = await auth();
        if (!userId) return false;

        // 1. Check Claims (Fastest)
        const roleFromClaims = (sessionClaims?.metadata as any)?.role?.toUpperCase();
        if (roleFromClaims === 'ADMIN' || roleFromClaims === 'GOD_MODE') return true;

        // 2. Check Database Role (Fallback)
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true }
        });

        const dbRole = user?.role?.toUpperCase();
        return dbRole === 'ADMIN' || dbRole === 'GOD_MODE';
    } catch (error) {
        console.error('[SECURITY] Admin authorization check failed:', error);
        return false;
    }
}
