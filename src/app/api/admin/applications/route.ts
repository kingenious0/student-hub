import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (user?.role !== 'ADMIN' && user?.role !== 'GOD_MODE') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const applications = await prisma.vendorApplication.findMany({
            where: { status: 'PENDING' },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, applications });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (user?.role !== 'ADMIN' && user?.role !== 'GOD_MODE') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await request.json();

        // Find application to get userId
        const application = await prisma.vendorApplication.findUnique({
            where: { id }
        });

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Transaction: Delete App & Reset User Status
        await prisma.$transaction([
            prisma.vendorApplication.delete({
                where: { id }
            }),
            prisma.user.update({
                where: { id: application.userId },
                data: { vendorStatus: 'NOT_APPLICABLE' }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete app error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

