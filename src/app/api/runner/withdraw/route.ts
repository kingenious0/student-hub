
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (user.banned) {
            return NextResponse.json({ error: `Account banned: ${user.banReason || 'Contact support'}` }, { status: 403 });
        }

        if (user.walletFrozen) {
            return NextResponse.json({ error: 'Your wallet has been frozen by an administrator.' }, { status: 403 });
        }

        if (user.balance < 1.00) {
            return NextResponse.json({ error: 'Minimum withdrawal is GHS 1.00' }, { status: 400 });
        }

        const amount = user.balance;

        // Transaction: Deduct Balance + Create Log
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { balance: 0 }
            });

            await tx.payoutRequest.create({
                data: {
                    userId: user.id,
                    amount: amount,
                    status: 'PROCESSED', // Auto-approved for MVP simulation
                    momoNumber: '054XXXXXXX', // Placeholder
                    network: 'MTN', // Placeholder
                }
            });
        });

        return NextResponse.json({ success: true, amount });

    } catch (error) {
        console.error('Withdraw error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
