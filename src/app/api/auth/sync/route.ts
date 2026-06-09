import { NextRequest, NextResponse } from 'next/server';
import { ensureUserExists } from '@/lib/auth/sync';



export async function POST(request: NextRequest) {
    try {
        const user = await ensureUserExists();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create response
        const response = NextResponse.json({ success: true, user });

        // If user is already onboarded, set the identity cookie to prevent onboarding loop
        if (user.onboarded) {
            response.cookies.set('LH_IDENTITY_VERIFIED', 'TRUE', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });
        }

        return response;
    } catch (error) {
        console.error('Auth sync error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    return POST(request);
}
