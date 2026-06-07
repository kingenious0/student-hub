import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { pushToken, platform } = await request.json();
    if (!pushToken) {
      return NextResponse.json({ error: 'Missing pushToken' }, { status: 400 });
    }

    const device = await prisma.devicePushToken.upsert({
      where: { pushToken },
      update: {
        userId: user.id,
        platform: platform || 'unknown',
        updatedAt: new Date(),
      },
      create: {
        pushToken,
        userId: user.id,
        platform: platform || 'unknown',
      },
    });

    return NextResponse.json({ success: true, device });
  } catch (error) {
    console.error('Device push register error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
