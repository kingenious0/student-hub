
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Ensures a user exists in the Prisma database.
 * If the user is authenticated via Clerk but missing from the DB, it creates them.
 * Returns the User object from Prisma.
 */
import { unstable_cache } from 'next/cache';
import { linkGuestOrdersByPhone } from '@/lib/orders/link-guest-orders';

// Cached user getter to reduce DB hits
const getCachedUser = unstable_cache(
    async (clerkId: string) => {
        return prisma.user.findUnique({
            where: { clerkId },
            select: {
                id: true,
                clerkId: true,
                email: true,
                name: true,
                role: true,
                university: true,
                onboarded: true,
                currentHotspot: true,
                lastActive: true,
                walletFrozen: true,
                banned: true,
                banReason: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    },
    ['user-by-clerk-id'], // Cache Key
    { tags: ['user'], revalidate: 60 } // Cache Strategy: 60s
);

/**
 * Ensures a user exists in the Prisma database.
 * If the user is authenticated via Clerk but missing from the DB, it creates them.
 * Returns the User object from Prisma.
 */
export async function ensureUserExists() {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    // Try to find the user in our database (Cached)
    let user = await getCachedUser(userId);

    // If not found, create them using Clerk details
    if (!user) {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return null;
        }

        const rawEmail = clerkUser.emailAddresses?.[0]?.emailAddress || `${clerkUser.username || clerkUser.id}@LaHustle-marketplace.com`;
        const email = rawEmail.trim().toLowerCase();

        const clerkPhone = clerkUser.phoneNumbers?.[0]?.phoneNumber || null;

        user = await prisma.user.upsert({
            where: { clerkId: userId },
            update: {}, // No updates if exists, just fetch
            create: {
                clerkId: userId,
                email: email,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous Student',
                role: 'STUDENT', // Default role
                university: 'USTED', // Default to USTED
                phoneNumber: clerkPhone,
            },
            select: {
                id: true,
                clerkId: true,
                email: true,
                name: true,
                role: true,
                university: true,
                onboarded: true,
                currentHotspot: true,
                lastActive: true,
                walletFrozen: true,
                banned: true,
                banReason: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        // Link any guest orders if the Clerk user has a phone number
        if (clerkPhone) {
            const linked = await linkGuestOrdersByPhone(clerkPhone, user.id);
            if (linked > 0) {
                console.log(`[Sync] Linked ${linked} guest order(s) to user ${user.id}`);
            }
        }

        console.log(`✅ Synced new user from Clerk: ${email}`);
    }

    return user;
}
