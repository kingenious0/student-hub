// export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { createGeofence } from '@/lib/location/radar-server';
import { linkGuestOrdersByPhone } from '@/lib/orders/link-guest-orders';
import { sendSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            console.log('Auth failed: userId or user is missing', { userId, userPresent: !!user });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name: providedName, university, phoneNumber } = body;

        console.log('Onboarding User:', {
            id: user.id,
            emailAddresses: user.emailAddresses,
            primaryEmailId: user.primaryEmailAddressId,
            providedName,
            university,
            phoneNumber
        });

        const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
            || user.emailAddresses[0]?.emailAddress
            || `${user.id}@LaHustle-placeholder.com`; // Fallback used if user signed up with Phone Number only

        console.log('Final email to use:', email);

        if (!email) {
            console.error('No email found for user:', user.id);
            return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        const name = providedName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous Student';

        // Everyone starts as STUDENT by default (Jumia-style)
        // They can apply to become a vendor later via /become-vendor
        const newUser = await prisma.user.upsert({
            where: { clerkId: userId },
            update: {
                name: name,
                university: university || 'USTED',
                onboarded: true,
                phoneNumber: phoneNumber
            },
            create: {
                clerkId: userId,
                email: email,
                name: name,
                role: 'STUDENT', // Everyone starts as STUDENT
                university: university || 'USTED',
                onboarded: true,
                vendorStatus: 'NOT_APPLICABLE',
                phoneNumber: phoneNumber
            }
        });

        // Link any guest orders from previous guest checkout using the same phone number
        let linkedOrderCount = 0;
        if (phoneNumber) {
            linkedOrderCount = await linkGuestOrdersByPhone(phoneNumber, newUser.id);
            if (linkedOrderCount > 0) {
                console.log(`[Onboarding] Linked ${linkedOrderCount} guest order(s) to user ${newUser.id}`);
            }
            try {
                const welcomeMessage = `Welcome to LaHustle! ⚡ Your campus marketplace is ready. Discover student deals, request services, and trade safely with secure escrow. Start hustling today!`;
                await sendSMS(phoneNumber, welcomeMessage);
                console.log(`[Onboarding] Welcome SMS sent to ${phoneNumber}`);
            } catch (smsErr) {
                console.error('[Onboarding] Welcome SMS failed to send:', smsErr);
            }
        }

        // Create response - For the USTED MVP, we set the identity cookie directly
        // after onboarding to allow frictionless access without high-friction biometric gating.
        const response = NextResponse.json({ success: true, linkedOrders: linkedOrderCount });
        
        response.cookies.set('LH_IDENTITY_VERIFIED', 'TRUE', {
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

