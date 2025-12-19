// src/components/products/ImageUpload.tsx
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = (result: any) => {
        if (result.event === 'success') {
            onChange(result.info.secure_url);
            setUploading(false);
        }
    };

    return (
        <div>
            <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PRODUCTS || 'student-hub-products'}
                options={{
                    folder: 'student-hub/products',
                    resourceType: 'image',
                    maxFileSize: 5000000, // 5MB
                    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                    maxImageWidth: 2000,
                    maxImageHeight: 2000,
                }}
                onUpload={handleUpload}
                onOpen={() => setUploading(true)}
                onClose={() => setUploading(false)}
            >
                {({ open }) => (
                    <div>
                        {value ? (
                            <div className="relative">
                                <img
                                    src={value}
                                    alt="Product"
                                    className="w-full h-48 object-cover rounded-lg border-2 border-white/20"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Change Image
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onChange('')}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => open()}
                                disabled={uploading}
                                className="w-full h-48 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-purple-500/50 transition-all disabled:opacity-50"
                            >
                                <div className="text-5xl">📸</div>
                                <div className="text-white font-semibold">
                                    {uploading ? 'Uploading...' : 'Upload Product Image'}
                                </div>
                                <div className="text-sm text-purple-300">
                                    Click to browse from your device
                                </div>
                            </button>
                        )}
                    </div>
                )}
            </CldUploadWidget>
        </div>
    );
}
