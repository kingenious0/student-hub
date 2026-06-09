
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import { sendSMS } from '@/lib/sms/wigal';

const RECOVERY_MESSAGES = [
    'Hey! You left some items in your cart on LaHustle. Complete your order now before someone else grabs them! 🛒',
    'Still thinking about it? Your cart is still waiting on LaHustle. Check out now and enjoy quick campus delivery! ⚡',
    'Last chance! Your LaHustle cart items are still available. Don\'t miss out — complete your order today! 🎯',
];

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { step } = body; // 0, 1, or 2

        if (typeof step !== 'number' || step < 0 || step > 2) {
            return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { phoneNumber: true, name: true, id: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.phoneNumber) {
            return NextResponse.json({ success: false, error: 'No phone number on file' });
        }

        const message = RECOVERY_MESSAGES[step];

        const result = await sendSMS(user.phoneNumber, message);

        return NextResponse.json({ success: result.success, error: result.error || undefined });
    } catch (error) {
        console.error('Cart recovery error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
