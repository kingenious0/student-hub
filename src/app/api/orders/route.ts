
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Sync user and get their DB record
        const { ensureUserExists } = await import('@/lib/auth/sync');
        let user = await ensureUserExists();

        // Hybrid Auth Fallback for WebViews
        if (!user) {
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                const isVerified = cookieStore.get('OMNI_IDENTITY_VERIFIED')?.value === 'TRUE';
                const hybridClerkId = cookieStore.get('OMNI_HYBRID_SYNCED')?.value;

                if (isVerified && hybridClerkId) {
                    user = await prisma.user.findUnique({
                        where: { clerkId: hybridClerkId },
                    });
                }
            } catch (e) {
                console.error('Hybrid auth fallback failed:', e);
            }
        }

        if (!user) {
            console.log('❌ /api/orders: User not found/synced.');
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log(`✅ /api/orders: Found user ${user.id} (${user.email}). Fetching orders...`);

        const orders = await prisma.order.findMany({
            where: {
                studentId: user.id,
            },
            select: {
                id: true,
                status: true,
                escrowStatus: true,
                amount: true,
                fulfillmentType: true,
                releaseKey: true,
                createdAt: true,
                paidAt: true,
                pickedUpAt: true,
                deliveredAt: true,
                product: {
                    select: {
                        title: true,
                        imageUrl: true,
                    },
                },
                vendor: {
                    select: {
                        name: true,
                        currentHotspot: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log(`📦 /api/orders: Found ${orders.length} orders for user ${user.id}`);
        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

