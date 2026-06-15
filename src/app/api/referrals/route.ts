
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let referralCode = await prisma.referralCode.findUnique({ where: { userId: user.id } });
        if (!referralCode) {
            const prefix = (user.name || 'USER').slice(0, 4).toUpperCase();
            const suffix = randomBytes(3).toString('hex').toUpperCase();
            const code = `${prefix}${suffix}`;

            referralCode = await prisma.referralCode.create({
                data: { userId: user.id, code },
            });
        }

        const referralCount = await prisma.referral.count({
            where: { referrerId: user.id, status: 'REWARDED' },
        });

        return NextResponse.json({
            success: true,
            code: referralCode.code,
            totalReferrals: referralCount,
            shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://LaHustle.ug'}/sign-up?ref=${referralCode.code}`,
        });
    } catch (error) {
        console.error('Referral code error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { refCode } = body;

        if (!refCode) return NextResponse.json({ error: 'refCode required' }, { status: 400 });

        const currentUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const referrerCode = await prisma.referralCode.findUnique({ where: { code: refCode } });
        if (!referrerCode) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        if (referrerCode.userId === currentUser.id) return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });

        const existing = await prisma.referral.findUnique({ where: { refereeId: currentUser.id } });
        if (existing) return NextResponse.json({ success: true, alreadyClaimed: true });

        await prisma.referral.create({
            data: {
                referrerId: referrerCode.userId,
                refereeId: currentUser.id,
                code: refCode,
                status: 'PENDING',
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Referral claim error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
