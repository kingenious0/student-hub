
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

// Simple Euclidean distance for face descriptors
function getEuclideanDistance(d1: number[], d2: number[]): number {
    if (d1.length !== d2.length) return 1.0; // Mismatch
    let sum = 0;
    for (let i = 0; i < d1.length; i++) {
        sum += (d1[i] - d2[i]) ** 2;
    }
    return Math.sqrt(sum);
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const descriptor = body.descriptor || body.faceDescriptor;

        if (!descriptor || !Array.isArray(descriptor)) {
            return NextResponse.json({ error: 'Invalid biometric data' }, { status: 400 });
        }

        // Fetch user's stored biometrics
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { faceDescriptor: true, clerkId: true }
        });

        if (!user || !user.faceDescriptor) {
            return NextResponse.json({ 
                verified: false, 
                error: 'NO_BIOMETRICS_FOUND',
                redirect: '/security-setup'
            });
        }

        // The stored descriptor is typically a JSON array of numbers
        const storedDescriptor = user.faceDescriptor as number[];
        
        // Calculate distance (Threshold is usually 0.6 for face-api.js)
        const distance = getEuclideanDistance(descriptor, storedDescriptor);
        
        console.log(`[BIOMETRIC] Verify User ${userId} - Distance: ${distance}`);

        if (distance < 0.55) { // Slightly stricter threshold for security
            // Verified!
            const response = NextResponse.json({ 
                verified: true, 
                username: user.clerkId
            });

            // Set the Identity Cookie
            response.cookies.set('LH_IDENTITY_VERIFIED', 'TRUE', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            return response;
        } else {
            return NextResponse.json({ verified: false, error: 'Face not recognized' });
        }

    } catch (error) {
        console.error('Face verification failed:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
