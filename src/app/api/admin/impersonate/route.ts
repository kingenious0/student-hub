import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

async function checkAuth() {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role === 'GOD_MODE') return true;

    const cookieStore = await cookies();
    const bossToken = cookieStore.get('OMNI_BOSS_TOKEN');
    return bossToken?.value === 'AUTHORIZED_ADMIN';
}

// GET - Fetch impersonated user data
export async function GET(req: Request) {
    try {
        if (!await checkAuth()) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        // Fetch FULL user data for admin view
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                products: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                orders: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        product: true
                    }
                },
                stories: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
                payoutRequests: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user,
            viewMode: 'READ_ONLY_IMPERSONATION'
        });
    } catch (error) {
        console.error('[IMPERSONATE] Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch user data' }, { status: 500 });
    }
}

// POST - Set/Clear impersonation cookie
export async function POST(req: Request) {
    try {
        if (!await checkAuth()) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { userId, action } = await req.json();

        const cookieStore = await cookies();

        if (action === 'START') {
            // Set impersonation cookie
            cookieStore.set('IMPERSONATE_USER_ID', userId, {
                httpOnly: false, // Needs to be accessible by client
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 // 1 hour
            });

            return NextResponse.json({
                success: true,
                message: `Impersonating user ${userId}`,
                userId
            });
        } else if (action === 'STOP') {
            // Clear impersonation
            cookieStore.delete('IMPERSONATE_USER_ID');

            return NextResponse.json({
                success: true,
                message: 'Stopped impersonation'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[IMPERSONATE] Error:', error);
        return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
    }
}
