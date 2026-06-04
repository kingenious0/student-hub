import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'VENDOR') return new Response('Forbidden', { status: 403 });

  const vendorId = user.id;
  let lastId = req.nextUrl.searchParams.get('since') || '';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      sendEvent('connected', { message: 'Stream connected' });

      const poll = async () => {
        try {
          const where: any = { vendorId };
          if (lastId) {
            where.id = { gt: lastId };
          }

          const orders = await prisma.order.findMany({
            where,
            include: {
              items: { include: { product: { select: { title: true, imageUrl: true } } } },
              student: { select: { name: true, email: true, phoneNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
          });

          if (orders.length > 0) {
            const newOrders = orders.filter(o => o.status === 'PAID');
            const statusUpdates = orders.filter(o => o.status !== 'PAID');

            if (newOrders.length > 0) {
              sendEvent('new_order', newOrders);
            }
            if (statusUpdates.length > 0) {
              sendEvent('order_update', statusUpdates);
            }

            lastId = orders[0].id;
          }

          sendEvent('heartbeat', { ts: Date.now() });
        } catch (err) {
          console.error('SSE poll error:', err);
        }
      };

      await poll();
      const interval = setInterval(poll, 3000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
