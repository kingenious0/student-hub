import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true, balance: true, name: true }
        });

        const isAuthorized = vendor.role === 'VENDOR' || vendor.role === 'ADMIN' || vendor.role === 'GOD_MODE';
        if (!vendor || !isAuthorized) {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        const body = await req.json();
        const { amount, momoNumber, network } = body;

        const requestAmount = parseFloat(amount);

        if (isNaN(requestAmount) || requestAmount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (requestAmount > vendor.balance) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Map Ghana MoMo networks to standard Paystack bank codes
        const bankCodeMap: Record<string, string> = {
            'MTN': 'MTN',
            'VODA': 'VOD',
            'AT': 'ATL'
        };
        const bankCode = bankCodeMap[network] || 'MTN';

        let payoutStatus = 'PENDING';
        let payoutNotes: string | null = null;

        // Check Paystack balance before attempting transfer
        try {
            const { getBalance } = await import('@/lib/payments/paystack');
            const balances = await getBalance();
            const ghs = balances.find(b => b.currency === 'GHS');
            const paystackBalance = ghs ? ghs.balance : 0;

            if (paystackBalance < requestAmount) {
                const shortfall = requestAmount - paystackBalance;
                console.warn(`[PayoutInstant] Paystack balance ₵${paystackBalance} insufficient for ₵${requestAmount} payout (shortfall ₵${shortfall}). Queuing as PENDING.`);
                payoutNotes = `Insufficient Paystack balance: ₵${paystackBalance.toFixed(2)} available, ₵${shortfall.toFixed(2)} more needed.`;
            }
        } catch (e) {
            console.error(`[PayoutInstant] Failed to check Paystack balance, proceeding with direct transfer:`, e);
        }

        if (!payoutNotes) {
            try {
                console.log(`[PayoutInstant] Initiating Paystack transfer for ${vendor.id}. MoMo: ${momoNumber}, Net: ${network}`);
                
                const { createTransferRecipient, initiateTransfer } = await import('@/lib/payments/paystack');
                
                // 1. Create Recipient
                const recipientCode = await createTransferRecipient(
                    vendor.name || 'LaHustle Vendor',
                    momoNumber,
                    bankCode
                );
                
                // 2. Initiate Transfer
                const transfer = await initiateTransfer(
                    requestAmount,
                    recipientCode,
                    `LaHustle Payout to ${vendor.name || 'Vendor'}`
                );
                
                console.log(`[PayoutInstant] Paystack success! Code: ${transfer.transfer_code}, Status: ${transfer.status}`);
                
                // If transfer is successfully queued or processed, mark processed!
                if (transfer.status === 'success' || transfer.status === 'otp' || transfer.status === 'pending') {
                    payoutStatus = 'PROCESSED';
                }
            } catch (e) {
                console.error(`[PayoutInstant] Paystack instant payout failed, falling back to manual PENDING status:`, e);
                payoutNotes = `Paystack transfer failed: ${e.message || 'Unknown error'}. Manual admin intervention required.`;
            }
        }

        // Complete the transaction in the database
        if (payoutStatus === 'PROCESSED') {
            await prisma.$transaction([
                prisma.payoutRequest.create({
                    data: {
                        amount: requestAmount,
                        vendorId: vendor.id,
                        momoNumber,
                        network,
                        status: 'PROCESSED',
                        processedAt: new Date()
                    }
                }),
                prisma.user.update({
                    where: { id: vendor.id },
                    data: {
                        balance: { decrement: requestAmount }
                    }
                })
            ]);
        } else {
            // Fallback: Deduct and freeze balance so the admin can process manually
            await prisma.$transaction([
                prisma.payoutRequest.create({
                    data: {
                        amount: requestAmount,
                        vendorId: vendor.id,
                        momoNumber,
                        network,
                        status: 'PENDING',
                        notes: payoutNotes
                    }
                }),
                prisma.user.update({
                    where: { id: vendor.id },
                    data: {
                        balance: { decrement: requestAmount },
                        frozenBalance: { increment: requestAmount }
                    }
                })
            ]);
        }

        return NextResponse.json({ success: true, instant: payoutStatus === 'PROCESSED' });

    } catch (error) {
        console.error('Payout request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
