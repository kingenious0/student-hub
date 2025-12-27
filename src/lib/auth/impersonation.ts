import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Gets the current user, but respects impersonation mode.
 * If admin is impersonating, returns the impersonated user's data.
 */
export async function getCurrentUser() {
    const { userId, sessionClaims } = await auth();

    // Check for impersonation
    const cookieStore = await cookies();
    const impersonateUserId = cookieStore.get('IMPERSONATE_USER_ID')?.value;

    if (impersonateUserId) {
        // Verify admin privileges
        const role = (sessionClaims?.metadata as any)?.role;
        const bossToken = cookieStore.get('OMNI_BOSS_TOKEN');
        const isAdmin = role === 'GOD_MODE' || role === 'ADMIN' || bossToken?.value === 'AUTHORIZED_ADMIN';

        if (isAdmin) {
            // Return impersonated user
            const impersonatedUser = await prisma.user.findUnique({
                where: { id: impersonateUserId }
            });

            if (impersonatedUser) {
                return {
                    ...impersonatedUser,
                    isImpersonating: true,
                    originalUserId: userId
                };
            }
        }
    }

    // Normal flow - return actual logged-in user
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    });

    return user;
}

/**
 * Gets the actual Clerk user ID (ignores impersonation)
 */
export async function getActualUserId() {
    const { userId } = await auth();
    return userId;
}

/**
 * Checks if currently impersonating
 */
export async function isImpersonating() {
    const cookieStore = await cookies();
    return !!cookieStore.get('IMPERSONATE_USER_ID')?.value;
}

/**
 * Gets impersonated user ID if impersonating
 */
export async function getImpersonatedUserId() {
    const cookieStore = await cookies();
    return cookieStore.get('IMPERSONATE_USER_ID')?.value || null;
}
