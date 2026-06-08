import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';

/**
 * Clean Slate Production Reset
 * 
 * Secure Admin-only endpoint that clears out all test orders, test payouts,
 * and resets all user balances back to 0.00. This prepares the system for
 * a clean live production launch.
 */
export async function POST(request: NextRequest) {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden: Insufficient clearance' }, { status: 403 });
    }

    try {
        console.log('[CLEAN-SLATE] Initiating database production reset...');

        // Perform clean slate in transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete PayoutRequests
            const payoutsDeleted = await tx.payoutRequest.deleteMany({});
            console.log(`[CLEAN-SLATE] Deleted ${payoutsDeleted.count} payout requests.`);

            // 2. Delete OrderItems
            const itemsDeleted = await tx.orderItem.deleteMany({});
            console.log(`[CLEAN-SLATE] Deleted ${itemsDeleted.count} order items.`);

            // 3. Delete Orders
            const ordersDeleted = await tx.order.deleteMany({});
            console.log(`[CLEAN-SLATE] Deleted ${ordersDeleted.count} orders.`);

            // 4. Delete OrderGroups
            const groupsDeleted = await tx.orderGroup.deleteMany({});
            console.log(`[CLEAN-SLATE] Deleted ${groupsDeleted.count} order groups.`);

            // 5. Reset all user financial balances to 0.00
            const usersReset = await tx.user.updateMany({
                data: {
                    balance: 0.00,
                    frozenBalance: 0.00
                }
            });
            console.log(`[CLEAN-SLATE] Reset financial balances for ${usersReset.count} users.`);
        });

        // Audit Log the reset event
        await logAdminAction('SYSTEM_CLEAN_SLATE_RESET', {
            timestamp: new Date().toISOString(),
            status: 'SUCCESS'
        });

        return NextResponse.json({
            success: true,
            message: 'Database successfully cleared to clean production slate! All balances reset to ₵0.00.'
        });

    } catch (error) {
        console.error('[CLEAN-SLATE] Failed to execute production reset:', error);
        return NextResponse.json({
            error: 'Failed to clear database to clean production slate',
            details: String(error)
        }, { status: 500 });
    }
}
