import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Admin Check
        const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (adminUser?.role !== 'ADMIN' && adminUser?.role !== 'GOD_MODE') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { applicationId } = await request.json();

        // Start Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch Application & User
            const app = await tx.vendorApplication.findUnique({
                where: { id: applicationId },
                include: { user: true }
            });

            if (!app) throw new Error("Application not found");
            if (app.status !== 'PENDING') throw new Error("Application already processed");

            const targetUser = app.user;

            // 2. Check Active Missions (Blocker)
            const activeMissions = await tx.mission.count({
                where: {
                    runnerId: targetUser.id,
                    status: { notIn: ['DELIVERED', 'CANCELLED', 'FAILED'] }
                }
            });

            if (activeMissions > 0) {
                throw new Error("User has active runner missions. Must complete them first.");
            }

            // 3. Promote User (Role Swap & Detail Update)
            // Note: Balance stays in 'balance' column. No transfer needed, just safe keeping.

            // Extract address from Json location if possible
            const loc: any = app.location;
            const landmark = loc?.address || "Campus Location";

            await tx.user.update({
                where: { id: targetUser.id },
                data: {
                    role: 'VENDOR',
                    isRunner: false,        // Deactivate Runner logic
                    runnerStatus: 'OFFLINE',
                    shopName: app.shopName,
                    shopLandmark: landmark,
                    vendorStatus: 'ACTIVE', // Immediate activation? Or Pending? User implied immediate "Approve"
                    onboarded: true
                }
            });

            // 4. Update Application Status
            await tx.vendorApplication.update({
                where: { id: app.id },
                data: { status: 'APPROVED' }
            });

            // 5. Log
            await tx.adminLog.create({
                data: {
                    adminId: adminUser.id,
                    action: 'PROMOTE_VENDOR',
                    details: `Promoted ${targetUser.email} (App: ${app.id}). Balance: ${targetUser.balance}`,
                }
            });

            return { success: true, email: targetUser.email };
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Promotion Error:', error);
        return NextResponse.json({ error: error.message || 'Promotion Failed' }, { status: 500 });
    }
}
