import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

async function checkAuth() {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role === 'GOD_MODE') return true;

    const cookieStore = await cookies();
    const bossToken = cookieStore.get('OMNI_BOSS_TOKEN');
    return bossToken?.value === 'AUTHORIZED_ADMIN';
}

export async function GET(req: Request) {
    try {
        if (!await checkAuth()) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                balance: true,
                walletFrozen: true,
                banned: true,
                banReason: true,
                vendorStatus: true,
                isRunner: true,
                lastActive: true,
                university: true
            }
        });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!await checkAuth()) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { targetUserId, action, value } = body;

        if (action === 'DELETE_USER') {
            const userToDelete = await prisma.user.findUnique({ where: { id: targetUserId } });
            if (!userToDelete) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Delete from Clerk
            try {
                const client = await clerkClient();
                await client.users.deleteUser(userToDelete.clerkId);
                console.log(`Deleted user ${userToDelete.clerkId} from Clerk`);
            } catch (err) {
                console.error('Failed to delete user from Clerk (might already be deleted):', err);
            }

            // Delete from DB
            await prisma.user.delete({
                where: { id: targetUserId }
            });

            return NextResponse.json({ success: true });
        }

        let updateData: any = {};

        if (action === 'FREEZE_WALLET') {
            // Proper freeze: set flag and zero balance
            updateData = {
                walletFrozen: true,
                balance: 0
            };
        } else if (action === 'UNFREEZE_WALLET') {
            // Unfreeze wallet
            updateData = { walletFrozen: false };
        } else if (action === 'BAN_USER') {
            // Ban user with reason
            updateData = {
                banned: true,
                banReason: value || 'Banned by administrator'
            };
        } else if (action === 'UNBAN_USER') {
            // Unban user
            updateData = {
                banned: false,
                banReason: null
            };
        } else if (action === 'SET_ROLE') {
            updateData = { role: value }; // value: 'ADMIN', 'VENDOR', 'STUDENT'
        } else if (action === 'SET_RUNNER') {
            updateData = { isRunner: value };
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: targetUserId },
                data: updateData
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin action failed:", error);
        return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
    }
}
