import { prisma } from '@/lib/db/prisma';

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body || null,
        link: params.link || null,
      },
    });
  } catch (error) {
    console.error('[NOTIFICATION] Failed to create:', error);
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  } catch (error) {
    console.error('[NOTIFICATION] Failed to count:', error);
    return 0;
  }
}

export async function getNotifications(userId: string, limit = 20) {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('[NOTIFICATION] Failed to fetch:', error);
    return [];
  }
}

export async function markAsRead(notificationId: string, userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  } catch (error) {
    console.error('[NOTIFICATION] Failed to mark read:', error);
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } catch (error) {
    console.error('[NOTIFICATION] Failed to mark all read:', error);
  }
}
