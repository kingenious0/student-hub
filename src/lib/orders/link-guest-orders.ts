import { prisma } from '@/lib/db/prisma';

export async function linkGuestOrdersByPhone(phoneNumber: string, newUserId: string): Promise<number> {
    if (!phoneNumber || !newUserId) return 0;

    const guestUsers = await prisma.user.findMany({
        where: {
            clerkId: { startsWith: 'guest_' },
            phoneNumber: phoneNumber,
            OR: [
                { orderGroups: { some: {} } },
                { orders: { some: {} } }
            ]
        },
        select: { id: true }
    });

    if (guestUsers.length === 0) return 0;

    const guestIds = guestUsers.map(u => u.id);

    const [orderGroupResult, orderResult] = await Promise.all([
        prisma.orderGroup.updateMany({
            where: { studentId: { in: guestIds } },
            data: { studentId: newUserId }
        }),
        prisma.order.updateMany({
            where: { studentId: { in: guestIds } },
            data: { studentId: newUserId }
        })
    ]);

    await prisma.user.deleteMany({
        where: { id: { in: guestIds } }
    });

    const totalLinked = orderGroupResult.count + orderResult.count;
    console.log(`[Guest Order Link] Transferred ${orderGroupResult.count} order groups and ${orderResult.count} orders from ${guestUsers.length} guest user(s) to user ${newUserId}`);

    return totalLinked;
}
