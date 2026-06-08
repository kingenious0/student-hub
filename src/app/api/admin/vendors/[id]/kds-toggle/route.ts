import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';

export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = await params;

        const vendor = await prisma.user.findUnique({
            where: { id },
            select: { id: true, kdsEnabled: true, name: true, shopName: true },
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const updated = await prisma.user.update({
            where: { id },
            data: { kdsEnabled: !vendor.kdsEnabled },
            select: { kdsEnabled: true },
        });

        await logAdminAction(
            updated.kdsEnabled ? 'KDS_ENABLED' : 'KDS_DISABLED',
            { vendorId: id, vendorName: vendor.shopName || vendor.name }
        );

        return NextResponse.json({ success: true, kdsEnabled: updated.kdsEnabled });
    } catch (error) {
        console.error('KDS toggle error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
