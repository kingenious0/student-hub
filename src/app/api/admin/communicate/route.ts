import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthorizedAdmin } from '@/lib/auth/admin';
import { sendSMS, sendBulkSMS } from '@/lib/sms/wigal';
import { sendPushNotification } from '@/lib/notifications/push';

export async function POST(req: NextRequest) {
    // Security Check
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Uplink Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { channel = 'SMS', mode, recipient, group, message, title = 'System Notification', url } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message content missing' }, { status: 400 });
        }

        if (channel === 'SMS') {
            if (mode === 'SINGLE') {
                if (!recipient) return NextResponse.json({ error: 'Recipient required' }, { status: 400 });

                const result = await sendSMS(recipient, message);
                return NextResponse.json(result);
            }
            else if (mode === 'BULK') {
                let whereClause: any = { phoneNumber: { not: null } };

                if (group === 'VENDORS') {
                    whereClause.role = 'VENDOR';
                } else if (group === 'STUDENTS') {
                    whereClause.role = 'STUDENT';
                }

                const users = await prisma.user.findMany({
                    where: whereClause,
                    select: { phoneNumber: true }
                });

                const recipients = users.map(u => u.phoneNumber!).filter(p => p && p.length > 5);

                if (recipients.length === 0) {
                    return NextResponse.json({ success: false, error: 'No valid phone numbers found in selected group' });
                }

                const result = await sendBulkSMS(recipients, message);
                return NextResponse.json(result);
            }
            else if (mode === 'SELECTION') {
                const { recipients } = body;
                if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                    return NextResponse.json({ error: 'No recipients selected' }, { status: 400 });
                }
                const result = await sendBulkSMS(recipients, message);
                return NextResponse.json(result);
            }
        } else if (channel === 'PUSH') {
            if (mode === 'SINGLE') {
                if (!recipient) return NextResponse.json({ error: 'Recipient user ID required' }, { status: 400 });

                // Find user by ID or clerkId
                const targetUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { id: recipient },
                            { clerkId: recipient },
                            { email: recipient }
                        ]
                    }
                });

                if (!targetUser) {
                    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
                }

                const subs = await prisma.pushSubscription.findMany({
                    where: { userId: targetUser.id }
                });

                if (subs.length === 0) {
                    return NextResponse.json({ success: false, error: 'No active push subscriptions found for this user.' });
                }

                const results = await Promise.all(
                    subs.map(sub =>
                        sendPushNotification(
                            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                            { title, body: message, url }
                        )
                    )
                );

                const expired = results.filter(r => r.expired).map(r => r.endpoint).filter(Boolean) as string[];
                if (expired.length > 0) {
                    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: expired } } });
                }

                const successfulCount = results.filter(r => r.sent).length;
                return NextResponse.json({ success: true, sentCount: successfulCount, totalSubCount: subs.length });
            }
            else if (mode === 'BULK') {
                let whereClause: any = {};
                if (group === 'VENDORS') {
                    whereClause.user = { role: 'VENDOR' };
                } else if (group === 'STUDENTS') {
                    whereClause.user = { role: 'STUDENT' };
                }

                const subs = await prisma.pushSubscription.findMany({
                    where: whereClause
                });

                if (subs.length === 0) {
                    return NextResponse.json({ success: false, error: 'No active push subscriptions found in selected group.' });
                }

                const results = await Promise.all(
                    subs.map(sub =>
                        sendPushNotification(
                            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                            { title, body: message, url }
                        )
                    )
                );

                const expired = results.filter(r => r.expired).map(r => r.endpoint).filter(Boolean) as string[];
                if (expired.length > 0) {
                    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: expired } } });
                }

                const successfulCount = results.filter(r => r.sent).length;
                return NextResponse.json({ success: true, sentCount: successfulCount, totalSubCount: subs.length });
            }
        }

        return NextResponse.json({ error: 'Invalid Mode' }, { status: 400 });

    } catch (error) {
        console.error('Communicate API Error:', error);
        return NextResponse.json({ error: 'Transmission Failed' }, { status: 500 });
    }
}
