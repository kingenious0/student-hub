import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ensureUserExists } from '@/lib/auth/sync';

// export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const user = await ensureUserExists();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { shopName, shopLandmark } = await request.json();

        if (!shopName || !shopLandmark) {
            return NextResponse.json({ error: 'Shop name and landmark are required' }, { status: 400 });
        }

        // Check current status first to prevent resetting Active vendors
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { vendorStatus: true }
        });

        // Only set to PENDING if they are not already ACTIVE or SUSPENDED
        const shouldSetPending = !['ACTIVE', 'SUSPENDED'].includes(existingUser?.vendorStatus || '');

        await prisma.user.update({
            where: { id: user.id },
            data: {
                shopName,
                shopLandmark,
                role: 'VENDOR',
                vendorStatus: shouldSetPending ? 'PENDING' : undefined, // Preserve existing status if established
            }
        });

        return NextResponse.json({ success: true, message: 'Onboarding completed. Awaiting admin approval.' });
    } catch (error) {
        console.error('Vendor onboarding error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

