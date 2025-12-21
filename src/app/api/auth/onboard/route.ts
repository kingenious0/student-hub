
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { role, isRunner } = await request.json();

        // Update user in database
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                role: role,
                isRunner: !!isRunner,
                onboarded: true,
                // If they chose VENDOR, set their status to PENDING initially
                vendorStatus: role === 'VENDOR' ? 'PENDING' : 'NOT_APPLICABLE'
            },
        });

        // Create response and set the Identity Cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set('OMNI_IDENTITY_VERIFIED', 'TRUE', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Onboarding API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
