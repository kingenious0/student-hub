import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

// Use Node's crypto for simpler HMAC if not on Edge, but sticking to standard is fine.
// The helper uses standard Web Crypto API.
import { verifyWebhookSignature } from '@/lib/payments/paystack';

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get('x-paystack-signature');
        if (!signature) {
            return NextResponse.json({ error: 'No signature' }, { status: 400 });
        }

        const bodyText = await req.text(); // Raw body for HMAC

        // Use the verifyWebhookSignature from lib, but ensure it matches Node env if needed.
        // Actually, importing crypto module directly handles HMAC more reliably in Node environment than Web Crypto sometimes for large payloads.
        // Let's implement verification locally here to be 100% sure of the algorithm matches Paystack (SHA512).

        const secret = process.env.PAYSTACK_SECRET_KEY!;
        const hash = crypto.createHmac('sha512', secret).update(bodyText).digest('hex');

        if (hash !== signature) {
            console.error('Invalid Paystack Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Parse JSON
        const event = JSON.parse(bodyText);

        console.log(`[Paystack Webhook] Received Event: ${event.event}`);

        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;
            const metadata = data.metadata || {};
            const orderId = metadata.orderId || metadata.custom_fields?.find((f: any) => f.variable_name === 'orderId' || f.variable_name === 'order_id')?.value;

            console.log(`[Paystack Webhook] Processing Success for Ref: ${reference}, Order: ${orderId}`);

            if (orderId) {
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: {
                        student: true,
                        vendor: true,
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                });

                if (order && (order.status === 'PENDING' || order.status === 'CANCELLED')) {
                    const releaseKey = Math.floor(100000 + Math.random() * 900000).toString();
                    const allReadyMade = order.items.every(item => item.product?.isReadyMade ?? true);
                    const targetStatus = allReadyMade ? 'READY' : 'PAID';

                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: targetStatus,
                            escrowStatus: 'HELD',
                            releaseKey: releaseKey,
                            paidAt: new Date(),
                        },
                    });
                    console.log(`[Paystack Webhook] Order ${orderId} marked as ${targetStatus} with Escrow HELD and Key ${releaseKey}`);

                    // Trigger SMS Notifications asynchronously
                    try {
                        const { sendSMS } = await import('@/lib/sms/wigal');
                        if (order.student && order.student.phoneNumber) {
                            const studentName = order.student.name || 'Student';
                            const shop = order.vendor?.shopName || order.vendor?.name || 'Vendor';
                            const studentMsg = `OMNI PAY: Hello ${studentName}, payment of ₵${order.amount.toFixed(2)} is confirmed! 🛡️\nRelease Key for ${shop}: ${releaseKey}\nShare this key with the vendor ONLY when you receive your items.`;
                            sendSMS(order.student.phoneNumber, studentMsg).then(res => {
                                console.log('[SMS-NOTIFY-WEBHOOK] Student SMS Sent:', res);
                            });
                        }
                        if (order.vendor && order.vendor.phoneNumber) {
                            const vendorName = order.vendor.shopName || order.vendor.name || 'Vendor';
                            const itemsSummary = order.items.map(i => `${i.quantity}x ${i.productSnapshot && (i.productSnapshot as any).title || i.product?.title || 'Item'}`).join(', ');
                            const vendorMsg = `OMNI ORDER: Hello ${vendorName}, you have a new order! 🔔\nItems: ${itemsSummary}\nTotal: ₵${order.amount.toFixed(2)}\nFulfillment: ${order.fulfillmentType}\nOpen the OMNI Dashboard to manage and fulfill.`;
                            sendSMS(order.vendor.phoneNumber, vendorMsg).then(res => {
                                console.log('[SMS-NOTIFY-WEBHOOK] Vendor SMS Sent:', res);
                            });
                        }
                    } catch (smsError) {
                        console.error('[SMS-NOTIFY-WEBHOOK] Webhook single-order SMS error:', smsError);
                    }
                }
            } else {
                const orderGroup = await prisma.orderGroup.findUnique({
                    where: { paystackRef: reference },
                    include: {
                        student: true,
                        orders: {
                            include: {
                                vendor: true,
                                items: {
                                    include: {
                                        product: true
                                    }
                                }
                            }
                        }
                    },
                });

                if (!orderGroup) {
                    console.warn(`[Paystack Webhook] No order group found for ref ${reference}`);
                } else {
                    const updates = orderGroup.orders.map(async (order) => {
                        if (order.status !== 'PENDING' && order.status !== 'CANCELLED') return null;
                        const releaseKey = Math.floor(100000 + Math.random() * 900000).toString();
                        const allReadyMade = order.items.every(item => item.product?.isReadyMade ?? true);
                        const targetStatus = allReadyMade ? 'READY' : 'PAID';

                        return prisma.order.update({
                            where: { id: order.id },
                            data: {
                                status: targetStatus,
                                escrowStatus: 'HELD',
                                releaseKey: releaseKey,
                                paidAt: new Date()
                            }
                        });
                    });
                    const updatedOrders = await Promise.all(updates);
                    const newlyConfirmedOrders = updatedOrders.filter((o): o is NonNullable<typeof o> => !!o);

                    console.log(`[Paystack Webhook] OrderGroup ${orderGroup.id} orders marked as confirmed (READY/PAID) with unique Escrow Keys`);

                    // Trigger SMS Notifications only if we actually processed new updates (prevents duplicate SMS)
                    if (newlyConfirmedOrders.length > 0) {
                        try {
                            const { sendSMS } = await import('@/lib/sms/wigal');
                            const keyMap = new Map(newlyConfirmedOrders.map(o => [o.id, o.releaseKey]));

                            // A. Notify Student / Buyer
                            if (orderGroup.student && orderGroup.student.phoneNumber) {
                                const studentName = orderGroup.student.name || 'Student';
                                const totalAmount = orderGroup.totalAmount.toFixed(2);

                                const keyLines = orderGroup.orders.map(o => {
                                    const shop = o.vendor?.shopName || o.vendor?.name || 'Vendor';
                                    const key = keyMap.get(o.id) || o.releaseKey;
                                    return `- ${shop}: ${key}`;
                                }).join('\n');

                                const studentMsg = `OMNI PAY: Hello ${studentName}, payment of ₵${totalAmount} is confirmed! 🛡️\nRelease Keys:\n${keyLines}\nShare this key with the vendor ONLY when you receive your items.`;

                                sendSMS(orderGroup.student.phoneNumber, studentMsg).then(res => {
                                    console.log('[SMS-NOTIFY-WEBHOOK] Group Student SMS Sent:', res);
                                });
                            }

                            // B. Notify each Vendor / Seller
                            for (const o of orderGroup.orders) {
                                if (o.vendor && o.vendor.phoneNumber) {
                                    const vendorPhone = o.vendor.phoneNumber;
                                    const vendorName = o.vendor.shopName || o.vendor.name || 'Vendor';
                                    const itemsSummary = o.items.map(i => `${i.quantity}x ${i.productSnapshot && (i.productSnapshot as any).title || i.product?.title || 'Item'}`).join(', ');
                                    const amountStr = o.amount.toFixed(2);

                                    const vendorMsg = `OMNI ORDER: Hello ${vendorName}, you have a new order! 🔔\nItems: ${itemsSummary}\nTotal: ₵${amountStr}\nFulfillment: ${o.fulfillmentType}\nOpen the OMNI Dashboard to manage and fulfill.`;

                                    sendSMS(vendorPhone, vendorMsg).then(res => {
                                        console.log(`[SMS-NOTIFY-WEBHOOK] Group Vendor (${vendorName}) SMS Sent:`, res);
                                    });
                                }
                            }
                        } catch (smsError) {
                            console.error('[SMS-NOTIFY-WEBHOOK] Webhook group SMS error:', smsError);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('[Paystack Webhook] Error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
