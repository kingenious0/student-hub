import { NextRequest, NextResponse } from 'next/server';
import { sendSupportTicketEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms/wigal';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, subject, message, orderId } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'All fields (name, email, subject, message) are required' }, { status: 400 });
        }

        // Send Support Email to Admin
        await sendSupportTicketEmail({ name, email, subject, message, orderId });

        // SMS notification to the admin
        const adminPhone = process.env.ADMIN_SUPPORT_PHONE || '0597626090';
        if (adminPhone) {
            const smsText = `OMNI SUPPORT: New Ticket from ${name}. Subj: ${subject}. Check your email.`;
            await sendSMS(adminPhone, smsText);
        }

        return NextResponse.json({ success: true, message: 'Ticket received and support notified.' });
    } catch (error) {
        console.error('Support ticket submission error:', error);
        return NextResponse.json({ error: 'Failed to process ticket' }, { status: 500 });
    }
}
