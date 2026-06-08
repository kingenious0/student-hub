import { prisma } from './db/prisma';

interface EmailPayload {
    to: string;
    subject: string;
    htmlContent: string;
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;
const SENDER = { name: 'OMNI', email: 'noreply@omni.upsa.edu.gh' };

async function sendEmail(payload: EmailPayload) {
    if (!API_KEY) {
        console.warn('⚠️ Brevo API Key missing. Skipping email.');
        return;
    }

    try {
        const res = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: SENDER,
                to: [{ email: payload.to }],
                subject: payload.subject,
                htmlContent: payload.htmlContent
            })
        });

        if (!res.ok) {
            const err = await res.json();
            console.error('❌ Brevo Error:', err);
        } else {
            console.log(`📧 Email sent to ${payload.to}`);
        }
    } catch (error) {
        console.error('Email Fetch Error:', error);
    }
}

export async function sendOrderConfirmation(studentEmail: string, orderGroupCount: number, totalAmount: number) {
    const html = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Order Confirmed! 🚀</h1>
            <p>Thanks for shopping on OMNI.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Total Paid: ₵${totalAmount.toFixed(2)}</p>
                <p style="margin: 5px 0 0 0; font-size: 0.9em;">Includes ${orderGroupCount} separate shipments.</p>
            </div>
            <p>Your orders have been sent to the respective vendors. You will receive notifications when they are ready.</p>
            <a href="https://omni-student.com/orders" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Orders</a>
        </div>
    `;

    await sendEmail({
        to: studentEmail,
        subject: 'OMNI Receipt: Your order is confirmed',
        htmlContent: html
    });
}

export async function sendVendorNewOrderAlert(vendorEmail: string, orderId: string, itemCount: number) {
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #10B981;">New Order Received! 🔔</h2>
            <p>You have a new order (#${orderId.slice(0, 8)}) with ${itemCount} items.</p>
            <p>Please log in to your dashboard to accept and process it.</p>
            <a href="https://omni-student.com/dashboard/vendor" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Dashboard</a>
        </div>
    `;

    await sendEmail({
        to: vendorEmail,
        subject: '🔔 New OMNI Order Alert',
        htmlContent: html
    });
}

export async function sendSupportTicketEmail({
    name,
    email,
    subject,
    message,
    orderId
}: {
    name: string;
    email: string;
    subject: string;
    message: string;
    orderId?: string;
}) {
    const html = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #059669; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;">New Support Request Received 🎟️</h2>
            <div style="margin: 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #059669; text-decoration: none;">${email}</a></p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
                ${orderId ? `<p style="margin: 5px 0;"><strong>Order ID:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">#${orderId}</code></p>` : ''}
                <div style="margin-top: 20px; background: #f8fafc; border-left: 4px solid #059669; padding: 15px; border-radius: 6px; color: #1e293b; font-style: italic;">
                    ${message.replace(/\n/g, '<br/>')}
                </div>
            </div>
            <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; text-transform: uppercase;">
                Sent via OMNI Support Engine • System Notification
            </div>
        </div>
    `;

    const adminEmail = process.env.ADMIN_SUPPORT_EMAIL || 'omnighana@gmail.com';

    await sendEmail({
        to: adminEmail,
        subject: `[OMNI SUPPORT] ${subject}`,
        htmlContent: html
    });
}

export async function sendOrderIssueEmail({
    orderId,
    vendorName,
    vendorEmail,
    customerName,
    customerEmail,
    details
}: {
    orderId: string;
    vendorName: string;
    vendorEmail: string;
    customerName: string;
    customerEmail: string;
    details: string;
}) {
    const html = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #dc2626; border-bottom: 2px solid #fee2e2; padding-bottom: 10px; margin-top: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;">Order Issue Reported ⚠️</h2>
            <div style="margin: 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                <p style="margin: 5px 0;"><strong>Order ID:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">#${orderId}</code></p>
                <p style="margin: 5px 0;"><strong>Reported By Vendor:</strong> ${vendorName} (${vendorEmail})</p>
                <p style="margin: 5px 0;"><strong>Customer Details:</strong> ${customerName} (${customerEmail})</p>
                
                <div style="margin-top: 20px; background: #fff5f5; border-left: 4px solid #dc2626; padding: 15px; border-radius: 6px; color: #991b1b; font-weight: 500;">
                    <strong style="display: block; margin-bottom: 5px; color: #7f1d1d; text-transform: uppercase; font-size: 11px;">Issue Details:</strong>
                    ${details.replace(/\n/g, '<br/>')}
                </div>
            </div>
            <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; text-transform: uppercase;">
                OMNI Security Escrow Hold Protocol Activated
            </div>
        </div>
    `;

    const adminEmail = process.env.ADMIN_SUPPORT_EMAIL || 'omnighana@gmail.com';

    await sendEmail({
        to: adminEmail,
        subject: `⚠️ [OMNI ESCROW ISSUE] Order #${orderId.slice(0, 8).toUpperCase()}`,
        htmlContent: html
    });
}
