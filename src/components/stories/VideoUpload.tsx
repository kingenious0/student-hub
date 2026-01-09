'use client';

import { useState, useRef } from 'react';

interface VideoUploadProps {
    value: string;
    onChange: (url: string) => void;
    onError?: (message: string) => void;
}

export default function VideoUpload({ value, onChange, onError }: VideoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper for errors
    const handleError = (msg: string) => {
        setUploading(false);
        setProgress(0);
        if (onError) onError(msg);
        else alert(msg); // Fallback if no error handler
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        if (!validTypes.includes(file.type)) {
            handleError('Invalid file format. Please upload MP4, MOV, AVI, or WebM.');
            return;
        }

        // Validate file size (100MB max)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            handleError('Video file is too large. Maximum size is 100MB.');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            // 1. Get Signature
            const signRes = await fetch('/api/cloudinary-sign', { method: 'POST' });
            if (!signRes.ok) throw new Error('Failed to authorize upload.');

            const { signature, timestamp, cloudName, apiKey, folder } = await signRes.json();

            // 2. Prepare Direct Upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', folder);

            // 3. Upload with XHR to track progress
            // (Fetch doesn't support upload progress yet widely)
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setProgress(percent);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    onChange(response.secure_url); // Cloudinary returns secure_url
                    setUploading(false);
                    setProgress(100);
                } else {
                    console.error('Cloudinary Error:', xhr.responseText);
                    handleError('Upload failed. The server rejected the file.');
                }
            });

            xhr.addEventListener('error', () => {
                handleError('Network error. Check your internet connection.');
            });

            const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
            xhr.open('POST', uploadUrl);
            xhr.send(formData);

        } catch (error) {
            console.error('Upload flow error:', error);
            handleError('Failed to initiate upload.');
        }
    };

    const handleRemove = () => {
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {!value ? (
                /* Upload Button */
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="video-upload-input"
                    />
                    <label
                        htmlFor="video-upload-input"
                        className={`block w-full py-16 border-2 border-dashed border-surface-border rounded-2xl hover:border-primary/50 transition-all group relative overflow-hidden ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 text-center">
                            <div className="text-6xl mb-4 animate-float">
                                {uploading ? '⏳' : '📹'}
                            </div>
                            <p className="text-foreground font-black text-lg uppercase tracking-tight mb-2">
                                {uploading ? `Transmitting... ${progress}%` : 'Upload Video'}
                            </p>
                            <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest">
                                {uploading ? 'Do not close this window' : 'Click to select video'}
                            </p>
                            <p className="text-foreground/20 text-[10px] font-bold uppercase tracking-widest mt-2">
                                MP4, MOV, AVI, WEBM • Max 100MB
                            </p>
                        </div>

                        {/* Progress Bar */}
                        {uploading && (
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                                <div
                                    className="h-full bg-gradient-to-r from-[#39FF14] to-[#2ecc71] transition-all duration-300 shadow-[0_0_10px_#39FF14]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </label>
                </div>
            ) : (
                /* Video Preview */
                <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-surface-border">
                        <video
                            src={value}
                            controls
                            className="w-full max-h-96 object-contain"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <label
                            htmlFor="video-upload-input"
                            className="flex-1 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer text-center"
                        >
                            Change Video
                        </label>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="flex-1 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Remove
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="video-upload-input"
                    />
                </div>
            )}
        </div>
    );
}
