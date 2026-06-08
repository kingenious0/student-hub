import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const hours = await prisma.vendorOperatingHours.findMany({
    where: { vendorId: user.id },
    orderBy: { dayOfWeek: 'asc' },
  });

  return NextResponse.json({ hours });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { hours } = await req.json();

  await prisma.vendorOperatingHours.deleteMany({ where: { vendorId: user.id } });

  if (hours && hours.length > 0) {
    await prisma.vendorOperatingHours.createMany({
      data: hours.map((h: any) => ({
        vendorId: user.id,
        dayOfWeek: h.dayOfWeek,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
