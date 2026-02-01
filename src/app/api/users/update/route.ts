import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, university, phoneNumber, notifications } = body;

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        name,
        university,
        phoneNumber,
        notificationSettings: notifications || {},
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
