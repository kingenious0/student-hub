import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';

export async function GET() {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden' }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                balance: true,
                phoneNumber: true,
                createdAt: true,
                vendorStatus: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ error: 'Data Retrieval Failed' }, { status: 500 });
    }
}
