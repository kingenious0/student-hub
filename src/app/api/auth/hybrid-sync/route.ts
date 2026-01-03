import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const redirectUrl = searchParams.get('redirect') || '/';

    if (!token) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    try {
        // 1. Verify the Native Token
        // In this architecture, the token is passed from Clerk-Expo to Clerk-NextJS
        // We Use the secret key to verify the session
        const client = await clerkClient();

        // Use the verifyToken helper from @clerk/backend (or imported via nextjs)
        const { verifyToken } = await import("@clerk/backend");
        const sessionToken = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        const clerkId = sessionToken.sub as string;

        if (!clerkId) throw new Error('Invalid Token');

        // 2. Ensure User exists in DB
        let user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            const clerkUser = await client.users.getUser(clerkId);
            user = await prisma.user.create({
                data: {
                    clerkId,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'OMNI User',
                    role: 'STUDENT',
                }
            });
        }

        // 3. Create a response that sets the OMNI_IDENTITY cookie
        const response = NextResponse.redirect(new URL(redirectUrl, req.url));

        // Critical: Set the identity cookie so the web app trusts this native user
        response.cookies.set('OMNI_IDENTITY_VERIFIED', 'TRUE', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Add a small helper cookie to tell the client-side to try and refresh Clerk
        response.cookies.set('OMNI_HYBRID_SYNCED', clerkId, {
            maxAge: 60 * 5, // 5 mins
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Hybrid Sync Error:', error);
        return NextResponse.redirect(new URL('/', req.url));
    }
}
