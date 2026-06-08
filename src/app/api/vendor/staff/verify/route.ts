import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!vendor || vendor.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { pin } = await req.json();
    if (!pin || pin.length < 4 || pin.length > 6) {
      return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
    }

    const hashed = hashPin(pin);

    const staff = await prisma.vendorStaff.findFirst({
      where: {
        vendorId: vendor.id,
        pin: hashed,
        isActive: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    await prisma.vendorStaff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
      },
      vendor: {
        id: vendor.id,
        shopName: vendor.shopName,
      },
    });

  } catch (error) {
    console.error('Staff verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
