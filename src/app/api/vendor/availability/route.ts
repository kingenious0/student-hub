import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { productId, isInStock } = await req.json();

  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { id: productId, vendorId: user.id },
  });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { isInStock },
  });

  return NextResponse.json({ product: updated });
}
