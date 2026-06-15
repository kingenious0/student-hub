const API_KEY = (process.env.MNOTIFY_API_KEY || '').replace(/['"]/g, '');
const SENDER_ID = (process.env.MNOTIFY_SENDER_ID || 'LaHustle').replace(/['"]/g, '');
const BASE_URL = 'https://api.mnotify.com/api';

function formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\s+/g, '');
    if (formatted.startsWith('0')) {
        formatted = '233' + formatted.substring(1);
    }
    if (formatted.startsWith('+')) {
        formatted = formatted.substring(1);
    }
    return formatted;
}

/**
 * Send SMS via mNotify Quick SMS API
 */
export async function sendSMS(to: string, message: string) {
    if (!API_KEY) {
        console.error('SERVER: MNOTIFY Credentials Missing');
        return { success: false, error: 'Configuration Error' };
    }

    const phone = formatPhoneNumber(to);

    const payload = {
        recipient: [phone],
        sender: SENDER_ID,
        message: message,
        is_schedule: false,
        schedule_date: ''
    };

    try {
        const response = await fetch(`${BASE_URL}/sms/quick?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
            console.error('mNotify Error:', data);
            return { success: false, error: data.message || 'Gateway Error' };
        }

        return { success: true, data };

    } catch (error) {
        console.error('mNotify Network Error:', error);
        return { success: false, error };
    }
}

/**
 * Send Bulk SMS via mNotify Quick SMS API
 */
export async function sendBulkSMS(recipients: string[], message: string) {
    if (!API_KEY) {
        console.error('SERVER: MNOTIFY Credentials Missing');
        return { success: false, error: 'Configuration Error' };
    }

    const validRecipients = recipients
        .filter(r => r && r.length > 5)
        .map(formatPhoneNumber);

    if (validRecipients.length === 0) {
        return { success: false, error: 'No valid recipients' };
    }

    const payload = {
        recipient: validRecipients,
        sender: SENDER_ID,
        message: message,
        is_schedule: false,
        schedule_date: ''
    };

    try {
        const response = await fetch(`${BASE_URL}/sms/quick?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
            console.error('mNotify Bulk Error:', data);
            return { success: false, error: data.message || 'Gateway Error' };
        }

        return { success: true, data };

    } catch (error) {
        console.error('mNotify Bulk Network Error:', error);
        return { success: false, error };
    }
}
