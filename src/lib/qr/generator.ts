// src/lib/qr/generator.ts
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';

const QR_SECRET = process.env.QR_SECRET || 'your-secret-key-change-in-production';
const QR_EXPIRY_HOURS = 24;

interface QRPayload {
    orderId: string;
    amount: number;
    vendorId: string;
    studentId: string;
    timestamp: number;
}

/**
 * Generate a secure, time-limited QR code for order verification
 * QR codes expire after 24 hours for security
 */
export async function generateOrderQRCode(
    orderId: string,
    amount: number,
    vendorId: string,
    studentId: string
): Promise<{ qrCodeValue: string; qrCodeDataURL: string }> {
    const payload: QRPayload = {
        orderId,
        amount,
        vendorId,
        studentId,
        timestamp: Date.now(),
    };

    // Encrypt the payload
    const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(payload),
        QR_SECRET
    ).toString();

    // Generate QR code as data URL (base64 image)
    const qrCodeDataURL = await QRCode.toDataURL(encrypted, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
    });

    return {
        qrCodeValue: encrypted,
        qrCodeDataURL,
    };
}

/**
 * Verify a QR code and extract the order details
 * Returns null if QR code is invalid or expired
 */
export function verifyQRCode(qrCodeValue: string): QRPayload | null {
    try {
        // Decrypt the payload
        const decrypted = CryptoJS.AES.decrypt(qrCodeValue, QR_SECRET).toString(
            CryptoJS.enc.Utf8
        );

        if (!decrypted) {
            return null;
        }

        const payload: QRPayload = JSON.parse(decrypted);

        // Check if QR code has expired (24 hours)
        const expiryTime = payload.timestamp + QR_EXPIRY_HOURS * 60 * 60 * 1000;
        if (Date.now() > expiryTime) {
            console.warn('QR code has expired');
            return null;
        }

        return payload;
    } catch (error) {
        console.error('QR code verification failed:', error);
        return null;
    }
}

/**
 * Generate a simple QR code for any text/URL
 */
export async function generateQRCode(text: string): Promise<string> {
    return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 200,
    });
}
