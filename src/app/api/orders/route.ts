
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// export const runtime = 'edge';

export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        let userId = clerkId;

        // Hybrid Auth Fallback for WebViews
        if (!userId) {
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                const isVerified = cookieStore.get('OMNI_IDENTITY_VERIFIED')?.value === 'TRUE';
                const hybridClerkId = cookieStore.get('OMNI_HYBRID_SYNCED')?.value;
                if (isVerified && hybridClerkId) {
                    userId = hybridClerkId;
                }
            } catch (e) {
                console.error('Hybrid auth fallback failed:', e);
            }
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

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

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

