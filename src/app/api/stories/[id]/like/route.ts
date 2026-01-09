import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';



export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Fix type: Next.js 15 params are promises
) {
    try {
        const { id: storyId } = await context.params;
        let { userId } = await auth();

        // Hybrid Auth Fallback
        if (!userId) {
            try {
                const cookieStore = await (await import('next/headers')).cookies();
                const isVerified = cookieStore.get('OMNI_IDENTITY_VERIFIED')?.value === 'TRUE';
                const hybridClerkId = cookieStore.get('OMNI_HYBRID_SYNCED')?.value;

                if (isVerified && hybridClerkId) {
                    userId = hybridClerkId;
                }
            } catch (e) {
                // Ignore
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user already liked this story
        const existingLike = await prisma.storyLike.findUnique({
            where: {
                storyId_userId: {
                    storyId,
                    userId: user.id,
                },
            },
        });

        let liked: boolean;
        let newLikeCount: number;

        if (existingLike) {
            // Unlike: Remove the like and decrement counter
            await prisma.storyLike.delete({
                where: { id: existingLike.id },
            });

            const story = await prisma.story.update({
                where: { id: storyId },
                data: {
                    likes: { decrement: 1 },
                },
            });

            liked = false;
            newLikeCount = Math.max(0, story.likes); // Prevent negative DB values just in case
        } else {
            // Like: Create like record and increment counter
            await prisma.storyLike.create({
                data: {
                    storyId,
                    userId: user.id,
                },
            });

            const story = await prisma.story.update({
                where: { id: storyId },
                data: {
                    likes: { increment: 1 },
                },
            });

            liked = true;
            newLikeCount = story.likes;
        }

        return NextResponse.json({
            success: true,
            liked,
            likes: newLikeCount,
        });
    } catch (error) {
        console.error('Like story error:', error);
        return NextResponse.json({ error: 'Failed to like story' }, { status: 500 });
    }
}

// GET endpoint to check if user has liked a story AND get real-time count
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: storyId } = await context.params;
        let { userId } = await auth();

        // Hybrid Auth Fallback
        if (!userId) {
            try {
                const cookieStore = await (await import('next/headers')).cookies();
                const isVerified = cookieStore.get('OMNI_IDENTITY_VERIFIED')?.value === 'TRUE';
                const hybridClerkId = cookieStore.get('OMNI_HYBRID_SYNCED')?.value;

                if (isVerified && hybridClerkId) {
                    userId = hybridClerkId;
                }
            } catch (e) { }
        }

        // Get live story count first (always needed)
        const story = await prisma.story.findUnique({
            where: { id: storyId },
            select: { likes: true }
        });

        if (!userId) {
            return NextResponse.json({ liked: false, likes: story?.likes || 0 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json({ liked: false, likes: story?.likes || 0 });
        }

        const existingLike = await prisma.storyLike.findUnique({
            where: {
                storyId_userId: {
                    storyId,
                    userId: user.id,
                },
            },
        });

        return NextResponse.json({
            liked: !!existingLike,
            likes: story?.likes || 0
        });
    } catch (error) {
        console.error('Check like error:', error);
        return NextResponse.json({ liked: false, likes: 0 });
    }
}
