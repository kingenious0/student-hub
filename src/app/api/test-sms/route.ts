import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms/wigal';
import { isAuthorizedAdmin } from '@/lib/auth/admin';

export async function POST(req: NextRequest) {
    // Only Admin can test freely to avoid spam cost
    if (!await isAuthorizedAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { phone, message } = await req.json();

        if (!phone || !message) {
            return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
        }

        const result = await sendSMS(phone, message);
        return NextResponse.json(result);

    } catch (error) {
        return NextResponse.json({ error: 'Test Failed' }, { status: 500 });
    }
}
