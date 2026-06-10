
const API_KEY = (process.env.WIGAL_API_KEY || '').replace(/['"]/g, '');
const USERNAME = (process.env.WIGAL_USERNAME || '').replace(/['"]/g, '');
const BASE_URL = (process.env.FROG_SMS_API_URL || 'https://frogapi.wigal.com.gh').replace(/['"]/g, '');
const SENDER_ID = (process.env.FROG_SMS_SENDER_ID || 'LaHustle').replace(/['"]/g, '');

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
                msgid: `LaHustle-${Date.now()}-${Math.floor(Math.random() * 1000)}`
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

/**
 * Send Bulk SMS via Wigal Frog API (V3)
 */
export async function sendBulkSMS(recipients: string[], message: string) {
    if (!API_KEY || !USERNAME) return { success: false, error: 'Config Missing' };

    // Filter and Format Numbers
    const validRecipients = recipients
        .filter(r => r && r.length > 5)
        .map(r => {
            let phone = r.replace(/\s+/g, '');
            if (phone.startsWith('0')) phone = '233' + phone.substring(1);
            if (phone.startsWith('+')) phone = phone.substring(1);
            return phone;
        });

    if (validRecipients.length === 0) return { success: false, error: 'No valid recipients' };

    const destinations = validRecipients.map(phone => ({
        destination: phone,
        msgid: `LaHustle-BULK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    }));

    // Wigal might limit destinations per request. Assuming reasonable limit or chunking needed.
    // For Safety, chunk by 50.
    const CHUNK_SIZE = 50;
    const chunks = [];
    for (let i = 0; i < destinations.length; i += CHUNK_SIZE) {
        chunks.push(destinations.slice(i, i + CHUNK_SIZE));
    }

    const results = [];

    for (const chunk of chunks) {
        const payload = {
            senderid: SENDER_ID,
            destinations: chunk,
            message: message,
            smstype: 'text'
        };

        try {
            const response = await fetch(`${BASE_URL}/api/v3/sms/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'API-KEY': API_KEY,
                    'USERNAME': USERNAME
                },
                body: JSON.stringify(payload)
            });
            results.push(await response.json());
        } catch (e) {
            console.error('Bulk Chunk Failed', e);
            results.push({ error: e });
        }
    }

    return { success: true, results };
}
