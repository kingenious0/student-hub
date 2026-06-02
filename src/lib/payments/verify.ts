import { prisma } from '@/lib/db/prisma';
import { sendOrderConfirmation, sendVendorNewOrderAlert } from '@/lib/email';

export async function confirmOrderGroupPayment(reference: string) {
    console.log(`[PaymentVerifyHelper] Processing payment for ref: ${reference}`);

    // 1. Find OrderGroup
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
        }
    });

    if (!orderGroup) {
        console.error(`[PaymentVerifyHelper] OrderGroup Not Found for ref: ${reference}`);
        return { success: false, error: 'Order Record Not Found', status: 404 };
    }

    // Idempotency check (if already paid, return success)
    const isAlreadyPaid = orderGroup.orders.some(o => o.status !== 'PENDING' && o.status !== 'CANCELLED');

    if (isAlreadyPaid) {
        console.log(`[PaymentVerifyHelper] Payment already processed for ref: ${reference}`);
        return { success: true, message: 'Payment already processed' };
    }

    // 2. Process Payments & Generate Keys
    const updates = orderGroup.orders.map(async (order) => {
        const releaseKey = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Check if all items in this order are ready-made
        const allReadyMade = order.items.every(item => item.product?.isReadyMade ?? true);
        const targetStatus = allReadyMade ? 'READY' : 'PAID';

        // Decrement inventory stockQuantity, toggle isInStock, and increment salesCount
        for (const item of order.items) {
            if (item.productId && item.product) {
                const newStock = Math.max(0, item.product.stockQuantity - item.quantity);
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: newStock,
                        isInStock: newStock > 0,
                        salesCount: { increment: item.quantity }
                    }
                });
            }
        }

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

    // 3. Automated Real-Time Email & SMS Notifications
    try {
        const { sendSMS } = await import('@/lib/sms/wigal');
        const keyMap = new Map(updatedOrders.map(o => [o.id, o.releaseKey]));

        // A. Notify Student / Buyer
        if (orderGroup.student) {
            // Send Email Receipt
            if (orderGroup.student.email) {
                sendOrderConfirmation(orderGroup.student.email, orderGroup.orders.length, orderGroup.totalAmount).catch(err => {
                    console.error('[EMAIL-NOTIFY] Student Email Failed:', err);
                });
            }

            // Send SMS Confirmation
            if (orderGroup.student.phoneNumber) {
                const studentName = orderGroup.student.name || 'Student';
                const totalAmount = orderGroup.totalAmount.toFixed(2);

                const keyLines = orderGroup.orders.map(o => {
                    const shop = o.vendor?.shopName || o.vendor?.name || 'Vendor';
                    const key = keyMap.get(o.id) || o.releaseKey;
                    return `- ${shop}: ${key}`;
                }).join('\n');

                const studentMsg = `OMNI PAY: Hello ${studentName}, payment of ₵${totalAmount} is confirmed! 🛡️\nRelease Keys:\n${keyLines}\nShare this key with the vendor ONLY when you receive your items.`;

                sendSMS(orderGroup.student.phoneNumber, studentMsg).then(res => {
                    console.log('[SMS-NOTIFY] Student SMS Sent:', res);
                });
            }
        }

        // B. Notify each Vendor / Seller
        for (const o of orderGroup.orders) {
            if (o.vendor) {
                // Send Email Notification
                if (o.vendor.email) {
                    sendVendorNewOrderAlert(o.vendor.email, o.id, o.items.length).catch(err => {
                        console.error(`[EMAIL-NOTIFY] Vendor (${o.vendor?.name}) Email Failed:`, err);
                    });
                }

                // Send SMS Notification
                if (o.vendor.phoneNumber) {
                    const vendorPhone = o.vendor.phoneNumber;
                    const vendorName = o.vendor.shopName || o.vendor.name || 'Vendor';
                    const itemsSummary = o.items.map(i => `${i.quantity}x ${(i.productSnapshot as any)?.title || i.product?.title || 'Item'}`).join(', ');
                    const amountStr = o.amount.toFixed(2);

                    const vendorMsg = `OMNI ORDER: Hello ${vendorName}, you have a new order! 🔔\nItems: ${itemsSummary}\nTotal: ₵${amountStr}\nFulfillment: ${o.fulfillmentType}\nOpen the OMNI Dashboard to manage and fulfill.`;

                    sendSMS(vendorPhone, vendorMsg).then(res => {
                        console.log(`[SMS-NOTIFY] Vendor (${vendorName}) SMS Sent:`, res);
                    });
                }
            }
        }
    } catch (notifyError) {
        console.error('[NOTIFY] Failed to dispatch notifications:', notifyError);
    }

    return {
        success: true,
        orders: updatedOrders
    };
}
