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
            select: { id: true, role: true, balance: true }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
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

        // Create payout request
        // In a real app, we would use a transaction to deduct balance immediately
        // For now, we'll keep the balance and deduct it when admin processes the payout
        await prisma.payoutRequest.create({
            data: {
                amount: requestAmount,
                vendorId: vendor.id,
                momoNumber,
                network,
                status: 'PENDING'
            }
        });

        // Optionally deduct balance now to prevent double requests
        await prisma.user.update({
            where: { id: vendor.id },
            data: {
                balance: { decrement: requestAmount },
                frozenBalance: { increment: requestAmount } // Move to frozen until processed
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Payout request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
