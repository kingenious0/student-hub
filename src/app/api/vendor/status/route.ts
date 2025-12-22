
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return new NextResponse(null, { status: 401 });

    try {
        const { isAcceptingOrders } = await req.json();

        await prisma.user.update({
            where: { clerkId: userId },
            data: { isAcceptingOrders }
        });

        return NextResponse.json({ success: true, isAcceptingOrders });
    } catch (error) {
        console.error('Status toggle failed:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
