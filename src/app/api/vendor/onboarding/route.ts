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

        const { shopName, shopLandmark, university } = await request.json();

        if (!shopName || !shopLandmark || !university) {
            return NextResponse.json({ error: 'Shop name, location, and university are required' }, { status: 400 });
        }

        // Check uniqueness of shop name
        const nameTaken = await prisma.user.findFirst({
            where: {
                shopName: { equals: shopName, mode: 'insensitive' },
                NOT: { id: user.id }
            }
        });

        if (nameTaken) {
            return NextResponse.json({ error: 'Shop name is already taken. Please choose a unique name.' }, { status: 409 });
        }

        // Check current status first to prevent resetting Active vendors
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { vendorStatus: true }
        });

        const isAlreadyApproved = ['ACTIVE', 'SUSPENDED'].includes(existingUser?.vendorStatus || '');
        let targetVendorStatus = 'PENDING';

        // Detailed Risk Analysis
        const prohibitedKeywords = ['admin', 'LaHustle', 'support', 'official', 'staff', 'manager', 'scam', 'test', 'system'];
        const textToScan = `${shopName} ${shopLandmark}`.toLowerCase();
        const hasRiskKeywords = prohibitedKeywords.some(word => textToScan.includes(word));

        if (!isAlreadyApproved) {
            if (hasRiskKeywords) {
                targetVendorStatus = 'PENDING';
                console.warn(`[Risk Flag] Vendor ${user.shopName} flagged for manual review.`);

                await prisma.adminLog.create({
                    data: {
                        adminId: 'SYSTEM_AUTOMATION',
                        action: 'VENDOR_FLAGGED',
                        details: `Vendor ${shopName} flagged for keywords. Status: PENDING.`,
                        ipAddress: '127.0.0.1'
                    }
                });
            } else {
                targetVendorStatus = 'ACTIVE';

                await prisma.adminLog.create({
                    data: {
                        adminId: 'SYSTEM_AUTOMATION',
                        action: 'VENDOR_AUTO_APPROVED',
                        details: `Vendor ${shopName} approved instantly. Hub: ${university}.`,
                        ipAddress: '127.0.0.1'
                    }
                });
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                shopName,
                shopLandmark,
                university,
                role: 'VENDOR',
                // Preserve status if already Active, otherwise use the calculated status
                vendorStatus: isAlreadyApproved ? undefined : targetVendorStatus,
            }
        });

        const statusMessage = targetVendorStatus === 'ACTIVE'
            ? 'Access Granted. Welcome to LaHustle.'
            : 'Access Pending. Awaiting admin review.';

        return NextResponse.json({ success: true, message: statusMessage, status: targetVendorStatus });
    } catch (error) {
        console.error('Vendor onboarding error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

