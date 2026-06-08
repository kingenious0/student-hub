import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { kdsEnabled: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        return NextResponse.json({ kdsEnabled: user.kdsEnabled });
    } catch (error) {
        console.error('KDS access error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
