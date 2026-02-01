import { NextRequest, NextResponse } from 'next/server';
import { getHybridUser } from '@/lib/auth/hybrid-auth';
import { prisma } from '@/lib/db/prisma';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate (Hybrid Friendly)
        // This helper checks Clerk Auth OR our Custom Mobile Cookie
        const { userId } = await getHybridUser();

        // 2. Authorization Context (for Admin/Impersonation)
        const cookieStore = await cookies();
        const impersonateUserId = cookieStore.get('IMPERSONATE_USER_ID')?.value;

        // 3. Impersonation Logic
        if (impersonateUserId) {
            // Verify Admin Status
            const { sessionClaims } = await auth();
            let isAdmin = false;

            // Check Claims
            const role = (sessionClaims?.metadata as any)?.role;
            if (role === 'GOD_MODE' || role === 'ADMIN') isAdmin = true;

            // Check Boss Token
            if (cookieStore.get('OMNI_BOSS_TOKEN')?.value === 'AUTHORIZED_ADMIN') isAdmin = true;

            // Fallback: Check DB if claims missing (e.g. Hybrid Mode)
            if (!isAdmin && userId) {
                const adminCheck = await prisma.user.findUnique({
                    where: { clerkId: userId },
                    select: { role: true }
                });
                if (adminCheck?.role === 'ADMIN' || adminCheck?.role === 'GOD_MODE') isAdmin = true;
            }

            if (isAdmin) {
                // Return Impersonated Profile directly
                const impersonatedUser = await prisma.user.findUnique({
                    where: { id: impersonateUserId }, // ID lookup
                    select: {
                        id: true,
                        clerkId: true,
                        email: true,
                        name: true,
                        role: true,
                        vendorStatus: true,
                        onboarded: true,
                        isRunner: true,
                        balance: true,
                        walletFrozen: true,
                        banned: true,
                        banReason: true,
                        shopName: true,
                        shopLandmark: true,
                        university: true,
                        phoneNumber: true,
                        notificationSettings: true
                    }
                });

                if (impersonatedUser) {
                    return NextResponse.json({
                        ...impersonatedUser,
                        impersonating: true,
                        originalUserId: userId
                    });
                }
            }
        }

        // 4. Normal User Fetch
        if (!userId) {
            return NextResponse.json({ role: 'GUEST' });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                id: true,
                clerkId: true,
                email: true,
                name: true,
                role: true,
                vendorStatus: true,
                onboarded: true,
                isRunner: true,
                balance: true,
                walletFrozen: true,
                banned: true,
                banReason: true,
                shopName: true,
                shopLandmark: true,
                university: true,
                phoneNumber: true,
                notificationSettings: true
            }
        });

        if (!user) {
            return NextResponse.json({ role: 'STUDENT' });
        }

        return NextResponse.json(user);

    } catch (error) {
        console.error('[/api/users/me] Error:', error);
        return NextResponse.json({ error: 'FAILED_TO_FETCH_PROFILE' }, { status: 500 });
    }
}
