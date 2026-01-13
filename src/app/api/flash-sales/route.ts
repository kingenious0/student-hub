import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch active flash sales (PUBLIC)
export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    // Fetch active flash sales that are currently running
    const flashSales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startTime: {
          lte: now, // Started
        },
        endTime: {
          gte: now, // Not expired
        },
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            category: {
              select: {
                name: true,
              },
            },
            vendor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        endTime: 'asc', // Ending soonest first
      },
      take: 12, // Limit to 12 flash sales
    });

    // Calculate stock remaining for each
    const flashSalesWithStock = flashSales.map((sale) => ({
      ...sale,
      stockRemaining: sale.stockLimit - sale.stockSold,
    }));

    // Get the earliest end time for countdown
    const earliestEndTime = flashSales.length > 0 ? flashSales[0].endTime : null;

    return NextResponse.json({
      flashSales: flashSalesWithStock,
      endTime: earliestEndTime,
    });
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
