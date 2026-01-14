
const API_KEY = process.env.WIGAL_API_KEY;
const USERNAME = process.env.WIGAL_USERNAME;
const BASE_URL = process.env.FROG_SMS_API_URL || 'https://frogapi.wigal.com.gh';
const SENDER_ID = process.env.FROG_SMS_SENDER_ID || 'Omni';

/**
 * Send SMS via Wigal Frog API (V3)
 */
export async function sendSMS(to: string, message: string) {
    if (!API_KEY || !USERNAME) {
        console.error('SERVER: WIGAL Credentials Missing');
        return { success: false, error: 'Configuration Error' };
    }

    // Format Number: 233...
    let phone = to.replace(/\s+/g, '');
    if (phone.startsWith('0')) phone = '233' + phone.substring(1);
    if (phone.startsWith('+')) phone = phone.substring(1);

    const payload = {
        senderid: SENDER_ID,
        destinations: [
            {
                destination: phone,
                msgid: `OMNI-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            }
        ],
        message: message,
        smstype: 'text'
    };

    try {
        const response = await fetch(`${BASE_URL}/api/v3/sms/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Search result said "API-KEY and USERNAME in request headers"
                // Note: Some legacy APIs might expect 'Api-Key', 'Username' or similar. 
                // We'll try standard casing.
                'API-KEY': API_KEY,
                'USERNAME': USERNAME
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('WIGAL Error:', data);
            return { success: false, error: data.message || 'Gateway Error' };
        }

        return { success: true, data };

    } catch (error) {
        console.error('SMS Network Error:', error);
        return { success: false, error };
    }
}
