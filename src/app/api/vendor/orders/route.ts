import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Not a vendor' }, { status: 403 });
        }

        const orders = await prisma.order.findMany({
            where: { vendorId: vendor.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                title: true,
                                imageUrl: true
                            }
                        }
                    }
                },
                student: {
                    select: {
                        name: true,
                        email: true,
                        phoneNumber: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ orders });

    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
