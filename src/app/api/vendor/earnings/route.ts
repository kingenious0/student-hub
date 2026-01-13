import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                id: true,
                role: true,
                balance: true,
                frozenBalance: true
            }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        const payouts = await prisma.payoutRequest.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' }
        });

        const pendingPayouts = payouts
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + p.amount, 0);

        const totalWithdrawn = payouts
            .filter(p => p.status === 'PROCESSED')
            .reduce((sum, p) => sum + p.amount, 0);

        return NextResponse.json({
            stats: {
                balance: vendor.balance,
                frozenBalance: vendor.frozenBalance,
                pendingPayouts,
                totalWithdrawn,
            },
            payouts
        });

    } catch (error) {
        console.error('Fetch earnings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
