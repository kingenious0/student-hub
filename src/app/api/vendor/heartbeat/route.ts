
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
    const { userId } = await auth();
    if (!userId) return new NextResponse(null, { status: 401 });

    try {
        await prisma.user.update({
            where: { clerkId: userId },
            data: { lastActive: new Date() }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Heartbeat failed:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
