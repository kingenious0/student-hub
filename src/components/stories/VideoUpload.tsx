// src/components/stories/VideoUpload.tsx
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

interface VideoUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onDurationChange?: (duration: number) => void;
}

export default function VideoUpload({ value, onChange, onDurationChange }: VideoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = (result: any) => {
        if (result.event === 'success') {
            onChange(result.info.secure_url);
            if (onDurationChange && result.info.duration) {
                onDurationChange(result.info.duration);
            }
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleProgress = (result: any) => {
        if (result.event === 'upload-progress') {
            const progress = Math.round((result.info.bytes / result.info.total_bytes) * 100);
            setUploadProgress(progress);
        }
    };

    return (
        <div>
            <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_STORIES || 'student-hub-stories'}
                options={{
                    folder: 'student-hub/stories',
                    resourceType: 'video',
                    maxFileSize: 50000000, // 50MB
                    clientAllowedFormats: ['mp4', 'mov', 'avi', 'webm'],
                    maxVideoFileSize: 50000000,
                    sources: ['local', 'camera'], // Allow recording from camera
                }}
                onUpload={handleUpload}
                onProgress={handleProgress}
                onOpen={() => setUploading(true)}
                onClose={() => {
                    setUploading(false);
                    setUploadProgress(0);
                }}
            >
                {({ open }) => (
                    <div>
                        {value ? (
                            <div className="relative">
                                <video
                                    src={value}
                                    controls
                                    className="w-full h-96 object-cover rounded-lg border-2 border-white/20"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Change Video
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
                            <div>
                                <button
                                    type="button"
                                    onClick={() => open()}
                                    disabled={uploading}
                                    className="w-full h-96 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-purple-500/50 transition-all disabled:opacity-50"
                                >
                                    <div className="text-6xl">🎥</div>
                                    <div className="text-white font-semibold text-xl">
                                        {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Story Video'}
                                    </div>
                                    <div className="text-sm text-purple-300 max-w-md text-center">
                                        Click to upload or record a vertical video (9:16 ratio)
                                        <br />
                                        Max 50MB • MP4, MOV, AVI, WebM
                                    </div>
                                </button>

                                {uploading && uploadProgress > 0 && (
                                    <div className="mt-4">
                                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-center text-purple-200 text-sm mt-2">
                                            {uploadProgress}% uploaded
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CldUploadWidget>
        </div>
    );
}
