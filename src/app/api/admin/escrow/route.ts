import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { cookies } from 'next/headers';

import { isAuthorizedAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
    try {
        // Security Check
        if (!await isAuthorizedAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Fetch all conflicts or active escrows
        // Prioritize 'HELD' status which means money is with us
        const activeEscrows = await prisma.order.findMany({
            where: {
                escrowStatus: 'HELD',
                status: { in: ['READY', 'PICKED_UP'] } // Orders in progress
            },
            include: {
                vendor: { select: { id: true, shopName: true, name: true } },
                student: { select: { id: true, name: true, email: true } },
                runner: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(activeEscrows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!await isAuthorizedAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { orderId, action } = await request.json(); // action: 'FORCE_RELEASE' | 'FORCE_REFUND'

        // Log the Force Action
        await prisma.adminLog.create({
            data: {
                adminId: userId!,
                action: `ESCROW_${action}`,
                details: `Forced action on Order ${orderId}`
            }
        });

        if (action === 'FORCE_RELEASE') {
            // Find order to get amount and vendor
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

            // Transaction: Update Order -> Add Balance to Vendor
            await prisma.$transaction([
                prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'COMPLETED',
                        escrowStatus: 'RELEASED',
                        deliveredAt: new Date()
                    }
                }),
                prisma.user.update({
                    where: { id: order.vendorId },
                    data: { balance: { increment: order.amount } }
                })
            ]);
            // NOTE: Runners don't get paid here automatically unless we add that logic, 
            // but usually a dispute means manual resolution. 
            // Ideally we should also pay the runner if they did the work. 
            // For now, simple vendor release is the priority.
        } else if (action === 'FORCE_REFUND') {
            // Just mark as REFUNDED. The actual money refund (Paystack) might be manual or via API.
            // For MVP, we flag it in DB.
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'REFUNDED',
                    escrowStatus: 'REFUNDED'
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
