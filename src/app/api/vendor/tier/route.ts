import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { getVendorTier } from '@/lib/vendor/tier';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const tier = await getVendorTier(user.id);

    return NextResponse.json({ tier });
  } catch (error) {
    console.error('Vendor tier error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
