import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Verify the God Mode password
        if (password !== 'omniadmin.com') {
            return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
        }

        console.log('[UNLOCK API] Password verified, setting cookie...');

        // Set cookie using Next.js cookies API (more reliable)
        const cookieStore = await cookies();
        cookieStore.set('OMNI_BOSS_TOKEN', 'AUTHORIZED_ADMIN', {
            path: '/',
            maxAge: 604800, // 7 days
            sameSite: 'lax',
            httpOnly: false, // Allow JavaScript access for debugging
        });

        console.log('[UNLOCK API] Cookie set successfully');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[UNLOCK API] Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// Disable middleware processing for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
