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

        const isAuthorized = vendor.role === 'VENDOR' || vendor.role === 'ADMIN' || vendor.role === 'GOD_MODE';
        if (!vendor || !isAuthorized) {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        // --- SELF-HEALING RECONCILIATION LOOP ---
        // 1. Fetch all completed orders
        const allCompletedOrders = await prisma.order.aggregate({
            where: { vendorId: vendor.id, status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const totalCompletedRevenue = allCompletedOrders._sum.amount || 0;

        // 2. Fetch all payout requests
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

        // 3. Calculate expected balance
        const expectedBalance = Math.max(0, totalCompletedRevenue - totalWithdrawn - pendingPayouts);

        // 4. If current db balance is out of sync, update it automatically
        let currentBalance = vendor.balance;
        if (Math.abs(vendor.balance - expectedBalance) > 0.01) {
            await prisma.user.update({
                where: { id: vendor.id },
                data: { balance: expectedBalance }
            });
            currentBalance = expectedBalance;
            console.log(`[EarningsReconciliation] Vendor ${vendor.id} balance healed from GHS ${vendor.balance} to GHS ${expectedBalance}`);
        }

        return NextResponse.json({
            stats: {
                balance: currentBalance,
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
