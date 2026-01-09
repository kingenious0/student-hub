import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        // Basic protection: Must be logged in
        if (!userId) {
            // Check for hybrid signature fallback if needed, but for now strict auth
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);

        // Parameters to sign
        // Note: For signed uploads, we usually specify 'folder' here if we want to enforce it
        const paramsToSign = {
            timestamp,
            folder: 'student-hub/stories',
            // eager: 'c_pad,h_300,w_400|c_crop,h_200,w_260', // Example eager transformations
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET as string
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: 'student-hub/stories'
        });

    } catch (error) {
        console.error('Cloudinary signing error:', error);
        return NextResponse.json({ error: 'Signing failed' }, { status: 500 });
    }
}
