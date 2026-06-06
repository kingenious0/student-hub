import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';

/**
 * Admin Payouts Management API
 * 
 * GET: Retrieve all PENDING payout requests with vendor profiles
 * POST: Manually retry and approve a PENDING payout request via live Paystack transfer
 */

export async function GET() {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden: Insufficient clearance' }, { status: 403 });
    }

    try {
        const pendingPayouts = await prisma.payoutRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        shopName: true,
                        phoneNumber: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        let paystackBalance = 0;
        try {
            const { getBalance } = await import('@/lib/payments/paystack');
            const balances = await getBalance();
            const ghs = balances.find(b => b.currency === 'GHS');
            if (ghs) paystackBalance = ghs.balance;
        } catch (e) {
            console.error('[AdminPayouts] Failed to fetch Paystack balance:', e);
        }

        const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

        return NextResponse.json({
            success: true,
            payouts: pendingPayouts,
            paystackBalance,
            totalPendingAmount,
            shortfall: Math.max(0, totalPendingAmount - paystackBalance)
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pending payouts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden: Insufficient clearance' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { payoutId, action } = body; // action: 'RETRY' or 'FORCE_APPROVE' or 'REJECT'

        if (!payoutId) {
            return NextResponse.json({ error: 'Payout Request ID is required' }, { status: 400 });
        }

        const payout = await prisma.payoutRequest.findUnique({
            where: { id: payoutId },
            include: { vendor: true }
        });

        if (!payout) {
            return NextResponse.json({ error: 'Payout Request not found' }, { status: 404 });
        }

        if (payout.status !== 'PENDING') {
            return NextResponse.json({ error: 'Payout is already processed or resolved' }, { status: 400 });
        }

        const { amount, momoNumber, network, vendorId } = payout;

        if (action === 'RETRY') {
            // Check Paystack balance before retrying
            let paystackBalance = 0;
            try {
                const { getBalance } = await import('@/lib/payments/paystack');
                const balances = await getBalance();
                const ghs = balances.find(b => b.currency === 'GHS');
                if (ghs) paystackBalance = ghs.balance;
            } catch (e) {
                console.error('[AdminPayoutRetry] Failed to check Paystack balance:', e);
            }

            if (paystackBalance < amount) {
                return NextResponse.json({
                    error: `Insufficient Paystack balance (₵${paystackBalance.toFixed(2)}) to process ₵${amount.toFixed(2)} payout. Fund your Paystack balance and try again.`,
                    paystackBalance,
                    shortfall: (amount - paystackBalance).toFixed(2)
                }, { status: 400 });
            }

            // Map Ghana MoMo networks to standard Paystack bank codes
            const bankCodeMap: Record<string, string> = {
                'MTN': 'MTN',
                'VODA': 'VOD',
                'AT': 'ATL'
            };
            const bankCode = bankCodeMap[network] || 'MTN';

            console.log(`[AdminPayoutRetry] Retrying Paystack transfer for payout: ${payoutId}`);

            const { createTransferRecipient, initiateTransfer } = await import('@/lib/payments/paystack');
            
            // 1. Create Recipient
            const recipientCode = await createTransferRecipient(
                payout.vendor.name || payout.vendor.shopName || 'OMNI Vendor',
                momoNumber,
                bankCode
            );
            
            // 2. Initiate Transfer
            const transfer = await initiateTransfer(
                amount,
                recipientCode,
                `OMNI Retried Payout to ${payout.vendor.name || 'Vendor'}`
            );

            console.log(`[AdminPayoutRetry] Paystack success! Code: ${transfer.transfer_code}, Status: ${transfer.status}`);

            // If Paystack reports queue success, finalize in database!
            if (transfer.status === 'success' || transfer.status === 'otp' || transfer.status === 'pending') {
                await prisma.$transaction([
                    prisma.payoutRequest.update({
                        where: { id: payoutId },
                        data: {
                            status: 'PROCESSED',
                            processedAt: new Date()
                        }
                    }),
                    prisma.user.update({
                        where: { id: vendorId },
                        data: {
                            frozenBalance: { decrement: amount } // Release frozen money
                        }
                    })
                ]);

                await logAdminAction('VENDOR_PAYOUT_RETRY_SUCCESS', { payoutId, amount });

                return NextResponse.json({ success: true, message: 'Payout successfully processed via Paystack!' });
            } else {
                throw new Error(`Paystack reported status: ${transfer.status}`);
            }
        } 
        
        if (action === 'FORCE_APPROVE') {
            // Force approve (Manual bypass if the admin sent MoMo directly from their phone)
            await prisma.$transaction([
                prisma.payoutRequest.update({
                    where: { id: payoutId },
                    data: {
                        status: 'PROCESSED',
                        processedAt: new Date()
                    }
                }),
                prisma.user.update({
                    where: { id: vendorId },
                    data: {
                        frozenBalance: { decrement: amount }
                    }
                })
            ]);

            await logAdminAction('VENDOR_PAYOUT_FORCE_APPROVE', { payoutId, amount });

            return NextResponse.json({ success: true, message: 'Payout force approved and marked as manually paid.' });
        }

        if (action === 'REJECT') {
            // Reject the payout and refund the vendor's active balance
            await prisma.$transaction([
                prisma.payoutRequest.update({
                    where: { id: payoutId },
                    data: {
                        status: 'REJECTED',
                        processedAt: new Date()
                    }
                }),
                prisma.user.update({
                    where: { id: vendorId },
                    data: {
                        frozenBalance: { decrement: amount },
                        balance: { increment: amount } // Refund balance
                    }
                })
            ]);

            await logAdminAction('VENDOR_PAYOUT_REJECTED', { payoutId, amount });

            return NextResponse.json({ success: true, message: 'Payout request rejected. Funds returned to vendor.' });
        }

        return NextResponse.json({ error: 'Invalid action protocol' }, { status: 400 });

    } catch (error: any) {
        console.error('[AdminPayoutAction] Error executing action:', error);
        return NextResponse.json({ 
            error: 'Failed to process payout action', 
            details: error.message || String(error) 
        }, { status: 500 });
    }
}
