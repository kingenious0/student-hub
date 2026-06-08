import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const period = req.nextUrl.searchParams.get('period') || 'today';

  const now = new Date();
  let startDate: Date;
  let prevStartDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      prevStartDate = new Date(startDate);
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
      break;
    default: // today
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
  }

  const vendorId = user.id;

  // Current period orders
  const currentOrders = await prisma.order.findMany({
    where: {
      vendorId,
      createdAt: { gte: startDate },
      status: { in: ['COMPLETED', 'PAID', 'PREPARING', 'READY'] },
    },
    include: {
      items: {
        include: { product: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Previous period orders (for comparison)
  const prevOrders = await prisma.order.findMany({
    where: {
      vendorId,
      createdAt: { gte: prevStartDate, lt: startDate },
      status: { in: ['COMPLETED', 'PAID', 'PREPARING', 'READY'] },
    },
  });

  // Top products (by sales count)
  const topProductsMap = new Map<string, { title: string; salesCount: number; revenue: number }>();
  for (const order of currentOrders) {
    for (const item of order.items) {
      const key = item.product?.title || 'Unknown';
      const existing = topProductsMap.get(key) || { title: key, salesCount: 0, revenue: 0 };
      existing.salesCount += item.quantity;
      existing.revenue += item.price * item.quantity;
      topProductsMap.set(key, existing);
    }
  }
  const topProducts = Array.from(topProductsMap.values())
    .sort((a, b) => b.salesCount - a.salesCount);

  // Peak hours
  const hourCounts = new Array(24).fill(0);
  for (const order of currentOrders) {
    const hour = new Date(order.createdAt).getHours();
    hourCounts[hour]++;
  }
  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(h => h.count > 0);

  // Calculations
  const todayRevenue = currentOrders.reduce((sum, o) => sum + o.amount, 0);
  const prevRevenue = prevOrders.reduce((sum, o) => sum + o.amount, 0);
  const periodComparison = prevRevenue > 0
    ? ((todayRevenue - prevRevenue) / prevRevenue) * 100
    : todayRevenue > 0 ? 100 : 0;
  const averageOrderValue = currentOrders.length > 0
    ? todayRevenue / currentOrders.length
    : 0;

  return NextResponse.json({
    todayRevenue,
    todayOrders: currentOrders.length,
    weekRevenue: todayRevenue, // simplified
    monthRevenue: todayRevenue,
    prevMonthRevenue: prevRevenue,
    topProducts: topProducts.slice(0, 10),
    peakHours,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    conversionRate: 0,
    periodComparison: Math.round(periodComparison * 10) / 10,
  });
}
