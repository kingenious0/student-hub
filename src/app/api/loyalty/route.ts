
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

const TIER_MULTIPLIERS: Record<string, number> = { BRONZE: 1, SILVER: 1.25, GOLD: 1.5, PLATINUM: 2 };
const POINTS_PER_CEDIS = 1;
const EXPIRY_MONTHS = 12;

async function getOrCreateAccount(userId: string) {
    let account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!account) {
        account = await prisma.loyaltyAccount.create({ data: { userId } });
    }
    return account;
}

async function getBalance(accountId: string): Promise<number> {
    const entries = await prisma.loyaltyLedger.findMany({
        where: {
            accountId,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
    });
    return Math.max(0, entries.reduce((sum, e) => sum + e.points, 0));
}

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const account = await getOrCreateAccount(user.id);
        const balance = await getBalance(account.id);

        const nextTierThresholds: Record<string, { tier: string; spendNeeded: number }> = {
            BRONZE: { tier: 'SILVER', spendNeeded: 50000 },
            SILVER: { tier: 'GOLD', spendNeeded: 100000 },
            GOLD: { tier: 'PLATINUM', spendNeeded: 250000 },
        };

        return NextResponse.json({
            success: true,
            balance,
            balanceInCedis: balance / 100,
            tier: account.tier,
            lifetimeSpendCents: account.lifetimeSpendCents,
            ...(nextTierThresholds[account.tier] || { tier: null, spendNeeded: null }),
        });
    } catch (error) {
        console.error('Loyalty balance error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const body = await request.json();
        const { type, referenceId, description } = body;

        if (type === 'PURCHASE') {
            const { amountCents } = body;
            if (!amountCents) return NextResponse.json({ error: 'amountCents required' }, { status: 400 });

            const account = await getOrCreateAccount(user.id);
            const multiplier = TIER_MULTIPLIERS[account.tier] || 1;
            const points = Math.round((amountCents / 100) * POINTS_PER_CEDIS * multiplier);
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + EXPIRY_MONTHS);

            await prisma.loyaltyLedger.create({
                data: {
                    accountId: account.id,
                    points,
                    type: 'PURCHASE',
                    referenceId,
                    description: description || `Points for order ${referenceId}`,
                    expiresAt,
                },
            });

            await prisma.loyaltyAccount.update({
                where: { id: account.id },
                data: { lifetimeSpendCents: { increment: amountCents } },
            });

            const newBalance = await getBalance(account.id);
            return NextResponse.json({ success: true, pointsEarned: points, newBalance });
        }

        if (type === 'REDEEM') {
            const { pointsToRedeem } = body;
            if (!pointsToRedeem || pointsToRedeem < 100) {
                return NextResponse.json({ error: 'Minimum 100 points to redeem' }, { status: 400 });
            }

            const account = await getOrCreateAccount(user.id);
            const balance = await getBalance(account.id);

            if (pointsToRedeem > balance) {
                return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
            }

            const discountCedis = (pointsToRedeem / 100);

            await prisma.loyaltyLedger.create({
                data: {
                    accountId: account.id,
                    points: -pointsToRedeem,
                    type: 'REDEMPTION',
                    referenceId,
                    description: description || `Redeemed for order ${referenceId}`,
                },
            });

            return NextResponse.json({
                success: true,
                pointsRedeemed: pointsToRedeem,
                discountCedis,
                discountCode: `LOYALTY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Loyalty operation error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
