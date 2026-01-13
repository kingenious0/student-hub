// export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { createGeofence } from '@/lib/location/radar-server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            console.log('Auth failed: userId or user is missing', { userId, userPresent: !!user });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name: providedName, university } = body;

        console.log('Onboarding User:', {
            id: user.id,
            emailAddresses: user.emailAddresses,
            primaryEmailId: user.primaryEmailAddressId,
            providedName,
            university
        });

        const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
            || user.emailAddresses[0]?.emailAddress
            || `${user.id}@omni-placeholder.com`; // Fallback used if user signed up with Phone Number only

        console.log('Final email to use:', email);

        if (!email) {
            console.error('No email found for user:', user.id);
            return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        const name = providedName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous Student';

        // Everyone starts as STUDENT by default (Jumia-style)
        // They can apply to become a vendor later via /become-vendor
        await prisma.user.upsert({
            where: { clerkId: userId },
            update: {
                name: name,
                university: university || 'KNUST',
                onboarded: true,
            },
            create: {
                clerkId: userId,
                email: email,
                name: name,
                role: 'STUDENT', // Everyone starts as STUDENT
                university: university || 'KNUST',
                onboarded: true,
                vendorStatus: 'NOT_APPLICABLE',
            }
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

