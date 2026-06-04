import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const staff = await prisma.vendorStaff.findMany({
    where: { vendorId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ staff: staff.map(s => ({ ...s, pin: '••••' })) });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, pin, role } = await req.json();

  if (!name || !pin || !role) {
    return NextResponse.json({ error: 'Name, PIN, and role are required' }, { status: 400 });
  }
  if (pin.length < 4 || pin.length > 6) {
    return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
  }

  const staff = await prisma.vendorStaff.create({
    data: { vendorId: user.id, name, pin: hashPin(pin), role },
  });

  return NextResponse.json({ staff: { ...staff, pin: '••••' } });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, isActive } = await req.json();

  await prisma.vendorStaff.updateMany({
    where: { id, vendorId: user.id },
    data: { isActive },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.vendorStaff.deleteMany({
    where: { id, vendorId: user.id },
  });

  return NextResponse.json({ success: true });
}
