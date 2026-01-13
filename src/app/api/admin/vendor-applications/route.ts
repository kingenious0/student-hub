import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { clerkClient } from '@clerk/nextjs/server';

// GET - Fetch all vendor applications
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const adminUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true }
        });

        if (!adminUser || !['ADMIN', 'GOD_MODE'].includes(adminUser.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all pending applications
        const applications = await prisma.vendorApplication.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        balance: true,
                        isRunner: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ applications });

    } catch (error) {
        console.error('Fetch applications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Approve or reject vendor application
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const adminUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true }
        });

        if (!adminUser || !['ADMIN', 'GOD_MODE'].includes(adminUser.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { applicationId, action } = body;

        if (!applicationId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get the application
        const application = await prisma.vendorApplication.findUnique({
            where: { id: applicationId },
            include: { user: true }
        });

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        if (action === 'APPROVE') {
            // Update application status
            await prisma.vendorApplication.update({
                where: { id: applicationId },
                data: { status: 'APPROVED' }
            });

            // Promote user to VENDOR
            await prisma.user.update({
                where: { id: application.userId },
                data: {
                    role: 'VENDOR',
                    vendorStatus: 'ACTIVE',
                    shopName: application.shopName,
                    shopLandmark: (application.location as any)?.location || 'Campus',
                }
            });

            // Update Clerk metadata
            try {
                await clerkClient.users.updateUserMetadata(application.user.clerkId, {
                    publicMetadata: {
                        role: 'VENDOR',
                        vendorStatus: 'ACTIVE'
                    }
                });
            } catch (clerkError) {
                console.error('Failed to update Clerk metadata:', clerkError);
            }

            return NextResponse.json({
                success: true,
                message: `${application.user.name} has been promoted to VENDOR!`,
                email: application.user.email
            });

        } else if (action === 'REJECT') {
            // Update application status
            await prisma.vendorApplication.update({
                where: { id: applicationId },
                data: { status: 'REJECTED' }
            });

            // Reset appliedForVendor flag so they can reapply
            await prisma.user.update({
                where: { id: application.userId },
                data: { appliedForVendor: false }
            });

            return NextResponse.json({
                success: true,
                message: `Application rejected. User can reapply.`
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Vendor approval error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
