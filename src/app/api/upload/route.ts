
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Function to generate SHA-1 signature using Web Crypto API (Edge compatible)
async function generateSignature(params: Record<string, string>, apiSecret: string) {
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + apiSecret;
    const msgBuffer = new TextEncoder().encode(toSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const timestamp = Math.round(new Date().getTime() / 1000).toString();
        const folder = type === 'video' ? 'student-hub/stories' : 'student-hub/products';
        const resourceType = type === 'video' ? 'video' : 'image';

        // Parameters to sign (must match what we send)
        const paramsToSign = {
            folder,
            timestamp,
        };

        const signature = await generateSignature(paramsToSign, apiSecret);

        // Prepare upload form data
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('api_key', apiKey);
        uploadFormData.append('timestamp', timestamp);
        uploadFormData.append('folder', folder);
        uploadFormData.append('signature', signature);

        // Upload to Cloudinary REST API
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            {
                method: 'POST',
                body: uploadFormData,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        return NextResponse.json({ url: data.secure_url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
