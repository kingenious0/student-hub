
'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
    storyId: string;
    src: string;
    isActive: boolean;
    onLike?: () => void;
    onShare?: () => void;
    likes?: number;
    username?: string;
    caption?: string;
    vendorClerkId?: string;
}

import { useUser } from '@clerk/nextjs';

export default function VideoPlayer({
    storyId,
    src,
    isActive,
    onLike,
    onShare,
    likes = 0,
    username = 'Vendor',
    caption = '',
    vendorClerkId,
}: VideoPlayerProps) {
    const { user } = useUser();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [localLikes, setLocalLikes] = useState(likes);
    const [hasLiked, setHasLiked] = useState(false);

    // Update local likes when prop changes
    useEffect(() => {
        setLocalLikes(likes);
    }, [likes]);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(e => console.log('Autoplay blocked:', e));
            setIsPlaying(true);
            // Record view
            fetch(`/api/stories/${storyId}/view`, { method: 'POST' }).catch(console.error);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
            }
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            setProgress((current / duration) * 100);
        }
    };

    const handleLike = async () => {
        if (hasLiked) return; // Prevent double-liking

        // Optimistic update
        setLocalLikes(prev => prev + 1);
        setHasLiked(true);

        try {
            const res = await fetch(`/api/stories/${storyId}/like`, {
                method: 'POST',
            });

            if (!res.ok) {
                // Revert on error
                setLocalLikes(prev => prev - 1);
                setHasLiked(false);
            }

            // Call parent callback if provided
            onLike?.();
        } catch (error) {
            console.error('Failed to like story:', error);
            // Revert on error
            setLocalLikes(prev => prev - 1);
            setHasLiked(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/stories?id=${storyId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Story by @${username}`,
                    text: caption || 'Check out this story on Campus Pulse!',
                    url: shareUrl,
                });
                onShare?.();
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
                onShare?.();
            } catch (error) {
                console.error('Failed to copy link:', error);
            }
        }
    };

    return (
        <div className="relative w-full h-full bg-black">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover"
                loop
                playsInline
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"
                >
                    <div className="text-6xl text-white/80">▶</div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Info Overlay */}
            <div className="absolute bottom-4 left-4 right-16 text-white pb-6">
                <div className="font-bold text-lg drop-shadow-md">@{username}</div>
                <p className="text-sm line-clamp-2 drop-shadow-md mt-1">{caption}</p>
            </div>

            {/* Actions Sidebar */}
            <div className="absolute bottom-8 right-2 flex flex-col items-center gap-6 pb-6">
                <button
                    onClick={handleLike}
                    className="flex flex-col items-center gap-1 group"
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm group-active:scale-90 transition-transform ${hasLiked ? 'bg-red-500/60' : 'bg-black/40'
                        }`}>
                        ❤️
                    </div>
                    <span className="text-white text-xs font-bold shadow-black drop-shadow-md">
                        {localLikes}
                    </span>
                </button>

                <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1 group"
                >
                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm group-active:scale-90 transition-transform">
                        ↗️
                    </div>
                    <span className="text-white text-xs font-bold shadow-black drop-shadow-md">
                        Share
                    </span>
                </button>

                <button
                    onClick={async () => {
                        try {
                            const response = await fetch(src);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `omni-pulse-${storyId.slice(0, 8)}.mp4`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        } catch (error) {
                            window.open(src, '_blank');
                        }
                    }}
                    className="flex flex-col items-center gap-1 group"
                >
                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm group-active:scale-90 transition-transform">
                        ⬇️
                    </div>
                    <span className="text-white text-xs font-bold shadow-black drop-shadow-md">
                        Save
                    </span>
                </button>

                {user?.id === vendorClerkId && (
                    <button
                        onClick={async () => {
                            if (confirm('Delete this story?')) {
                                const res = await fetch(`/api/stories/${storyId}`, { method: 'DELETE' });
                                if (res.ok) window.location.reload();
                            }
                        }}
                        className="flex flex-col items-center gap-1 group mt-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center backdrop-blur-sm border border-red-500/30 group-hover:bg-red-600 transition-colors">
                            🗑️
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
