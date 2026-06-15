import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone || phone.trim().length < 5) {
        return NextResponse.json({ hasGuestOrder: false });
    }

    try {
        // Find if there is any order belonging to a guest user with this phone number
        const guestOrder = await prisma.order.findFirst({
            where: {
                student: {
                    phoneNumber: phone.trim(),
                    clerkId: {
                        startsWith: 'guest_'
                    }
                }
            }
        });

        return NextResponse.json({ hasGuestOrder: !!guestOrder });
    } catch (error) {
        console.error('Check guest error:', error);
        return NextResponse.json({ hasGuestOrder: false }, { status: 500 });
    }
}
