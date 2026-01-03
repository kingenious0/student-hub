import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { cookies } from 'next/headers';

// export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        const { userId: authUserId, sessionClaims } = await auth();
        const searchParams = request.nextUrl.searchParams;
        const queryClerkId = searchParams.get('clerkId');
        const cookieStore = await cookies();
        const isHybridVerified = cookieStore.get('OMNI_IDENTITY_VERIFIED')?.value === 'TRUE';

        // Choose the active ID: either from Clerk Auth or from our Hybrid Sync param (if verified)
        const userId = authUserId || (isHybridVerified ? queryClerkId : null);

        // Check if admin is impersonating another user
        const impersonateUserId = cookieStore.get('IMPERSONATE_USER_ID')?.value;

        // If impersonating, check if current user is GOD_MODE or has admin token
        if (impersonateUserId) {
            const role = (sessionClaims?.metadata as any)?.role;
            const bossToken = cookieStore.get('OMNI_BOSS_TOKEN');
            const isAdmin = role === 'GOD_MODE' || role === 'ADMIN' || bossToken?.value === 'AUTHORIZED_ADMIN';

            if (isAdmin) {
                // Return impersonated user's data
                const impersonatedUser = await prisma.user.findUnique({
                    where: { id: impersonateUserId },
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
                        university: true
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

        // Normal flow - return logged-in user's data
        if (!userId) return NextResponse.json({ role: 'GUEST' });

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
                university: true
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
