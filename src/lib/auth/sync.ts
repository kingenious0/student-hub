
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

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

    // Try to find the user in our database
    let user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    // If not found, create them using Clerk details
    if (!user) {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return null;
        }

        const rawEmail = clerkUser.emailAddresses?.[0]?.emailAddress || `${clerkUser.username || clerkUser.id}@omni-marketplace.com`;
        const email = rawEmail.trim().toLowerCase();

        user = await prisma.user.create({
            data: {
                clerkId: userId,
                email: email,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous Student',
                role: 'STUDENT', // Default role
                university: 'KNUST', // Default for now, can be changed later
            },
        });

        console.log(`✅ Synced new user from Clerk: ${email}`);
    }

    return user;
}
