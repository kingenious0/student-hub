
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { amount, momoNumber, network } = await req.json();

        // 1. Get user and check balance
        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, balance: true }
        });

        if (!vendor) return new NextResponse("Vendor not found", { status: 404 });

        // Ensure amount is valid
        if (amount <= 0) return new NextResponse("Invalid amount", { status: 400 });
        if (vendor.balance < amount) return new NextResponse("Insufficient funds", { status: 400 });

        // 2. Transaction: Deduct balance, Create Request
        await prisma.$transaction([
            prisma.user.update({
                where: { id: vendor.id },
                data: { balance: { decrement: amount } }
            }),
            prisma.payoutRequest.create({
                data: {
                    amount,
                    momoNumber,
                    network,
                    vendorId: vendor.id,
                    status: 'PENDING' // Admin must approve
                }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Withdrawal failed:', e);
        return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
    }
}
