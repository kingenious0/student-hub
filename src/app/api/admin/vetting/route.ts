
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';

// Get all pending vendors
export async function GET() {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden: Insufficient clearance' }, { status: 403 });
    }

    try {
        const pendingVendors = await prisma.user.findMany({
            where: { vendorStatus: 'PENDING' },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ success: true, vendors: pendingVendors });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pending partners' }, { status: 500 });
    }
}

// Update vendor status
export async function POST(request: NextRequest) {
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden: Insufficient clearance' }, { status: 403 });
    }

    try {
        const { vendorId, action } = await request.json();

        if (!vendorId || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'SUSPENDED';

        await prisma.user.update({
            where: { id: vendorId },
            data: { vendorStatus: newStatus as 'ACTIVE' | 'SUSPENDED' }
        });

        // Audit Log
        await logAdminAction(`PARTNER_${action}`, { vendorId, newStatus });

        return NextResponse.json({ success: true, message: `Partner ${action}D successfully` });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
