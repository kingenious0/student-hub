'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface VideoPlayerProps {
    storyId: string;
    src: string;
    isActive: boolean;
    likes?: number;
    views?: number;
    username?: string;
    caption?: string;
    vendorClerkId?: string;
    variant?: 'theater' | 'feed' | 'card';
}

export default function VideoPlayer({
    storyId,
    src,
    isActive,
    likes = 0,
    views = 0,
    username = 'Vendor',
    caption = '',
    vendorClerkId,
    variant = 'theater',
}: VideoPlayerProps) {
    const { user } = useUser();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [localLikes, setLocalLikes] = useState(likes);
    const [localViews, setLocalViews] = useState(views);
    const [hasLiked, setHasLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Format numbers
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Update local state when props change
    useEffect(() => {
        setLocalLikes(likes);
        setLocalViews(views);
    }, [likes, views]);

    // Fetch initial state
    useEffect(() => {
        const fetchState = async () => {
            try {
                // Likes
                const likeRes = await fetch(`/api/stories/${storyId}/like`);
                if (likeRes.ok) {
                    const data = await likeRes.json();
                    setHasLiked(data.liked);
                    if (typeof data.likes === 'number') setLocalLikes(data.likes);
                }
                // Favorites
                const favRes = await fetch(`/api/stories/${storyId}/favorite`);
                if (favRes.ok) {
                    const data = await favRes.json();
                    setIsFavorited(data.favorited);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchState();
    }, [storyId]);

    // Handle Active State
    useEffect(() => {
        if (isActive) {
            const playPromise = videoRef.current?.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => setIsPlaying(false));
            }
            setIsPlaying(true);

            // Record View
            fetch(`/api/stories/${storyId}/view`, { method: 'POST' })
                .then(() => setLocalViews(prev => prev + 1))
                .catch(console.error);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.currentTime = 0;
        }
    }, [isActive, storyId]);

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

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newLiked = !hasLiked;
        setHasLiked(newLiked);
        setLocalLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

        // Animation Effect: Trigger a small burst/scale or particle if possible
        // For now, simpler CSS state

        try {
            await fetch(`/api/stories/${storyId}/like`, { method: 'POST' });
        } catch {
            setHasLiked(!newLiked);
            setLocalLikes(prev => newLiked ? Math.max(0, prev - 1) : prev + 1);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/stories?id=${storyId}`;
        if (navigator.share) {
            navigator.share({ title: 'Campus Pulse', text: caption, url }).catch(console.log);
        } else {
            navigator.clipboard.writeText(url);
            // Could add toast here
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newFav = !isFavorited;
        setIsFavorited(newFav);
        try {
            await fetch(`/api/stories/${storyId}/favorite`, { method: 'POST' });
        } catch {
            setIsFavorited(!newFav);
        }
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden group">
            {/* Video */}
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover"
                loop
                playsInline
                onClick={togglePlay}
                muted={isMuted}
                onTimeUpdate={() => {
                    if (videoRef.current) {
                        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
                    }
                }}
            />

            {/* Cinematic Gradient Overlays (Subtler) */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-50">
                <div
                    className="h-full bg-white/80 shadow-[0_0_8px_white] transition-all duration-100 linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Play/Pause Center Icon (Fades out) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-200">
                    <div className="w-16 h-16 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <span className="text-white text-3xl ml-1">▶</span>
                    </div>
                </div>
            )}

            {/* Mute Button (Top Right) - Small & Subtle */}
            <button
                onClick={toggleMute}
                className="absolute top-6 right-6 z-50 p-2 rounded-full glass-subtle hover:bg-white/10 transition-colors"
            >
                <div className="text-white text-sm opacity-80">
                    {isMuted ? '🔇' : '🔊'}
                </div>
            </button>

            {/* RIGHT SIDEBAR ACTIONS (Compact & Glass) */}
            <div className="absolute right-2 bottom-36 flex flex-col items-center gap-4 z-[60]">

                {/* Vendor Profile */}
                <div className="relative mb-2">
                    <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden shadow-lg">
                        <div className="w-full h-full bg-gradient-to-br from-[#39FF14] to-emerald-600 flex items-center justify-center text-black font-black text-sm">
                            {username[0]?.toUpperCase()}
                        </div>
                    </div>
                    {/* Follow Plus */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#39FF14] rounded-full flex items-center justify-center border border-black shadow-sm">
                        <span className="text-black text-[10px] font-bold">+</span>
                    </div>
                </div>

                {/* Like Button */}
                <button
                    onClick={handleLike}
                    className="flex flex-col items-center gap-1 group/btn"
                >
                    <div className="w-10 h-10 rounded-full glass-subtle flex items-center justify-center transition-all duration-300 active:scale-90 group-active/btn:scale-95">
                        <span className={`text-xl drop-shadow-sm transition-all ${hasLiked ? 'text-[#ff2d55] scale-110' : 'text-white scale-100'}`}>
                            {hasLiked ? '❤' : '🤍'}
                        </span>
                    </div>
                    <span className="text-white/90 text-[10px] font-bold drop-shadow-md">
                        {formatNumber(localLikes)}
                    </span>
                </button>

                {/* Comment Button */}
                <button className="flex flex-col items-center gap-1 group/btn">
                    <div className="w-10 h-10 rounded-full glass-subtle flex items-center justify-center transition-all duration-300 active:scale-90">
                        <span className="text-xl text-white drop-shadow-sm">💬</span>
                    </div>
                    <span className="text-white/90 text-[10px] font-bold drop-shadow-md">0</span>
                </button>

                {/* Favorite Button */}
                <button
                    onClick={toggleFavorite}
                    className="flex flex-col items-center gap-1 group/btn"
                >
                    <div className="w-10 h-10 rounded-full glass-subtle flex items-center justify-center transition-all duration-300 active:scale-90">
                        <span className={`text-xl drop-shadow-sm transition-all ${isFavorited ? 'text-[#fbbf24] scale-110' : 'text-white scale-100'}`}>
                            {isFavorited ? '★' : '☆'}
                        </span>
                    </div>
                    <span className="text-white/90 text-[10px] font-bold drop-shadow-md">Fav</span>
                </button>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1 group/btn"
                >
                    <div className="w-10 h-10 rounded-full glass-subtle flex items-center justify-center transition-all duration-300 active:scale-90">
                        <span className="text-xl text-white drop-shadow-sm">↪️</span>
                    </div>
                    <span className="text-white/90 text-[10px] font-bold drop-shadow-md">Share</span>
                </button>
            </div>

            {/* BOTTOM INFO OVERLAY (Clean & Left Aligned) */}
            <div className="absolute bottom-4 left-3 right-16 z-30 flex flex-col items-start gap-2.5">

                {/* User & Tag */}
                <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm drop-shadow-sm shadow-black">@{username}</h3>
                    <span className="bg-white/10 backdrop-blur-sm border border-white/5 px-1.5 py-0.5 rounded text-[9px] font-bold text-white/90 uppercase tracking-wide">
                        Vendor
                    </span>
                </div>

                {/* Caption - Collapsed by default via line-clamp */}
                {caption && (
                    <p className="text-white/90 text-xs font-normal leading-relaxed line-clamp-2 drop-shadow-sm max-w-[95%]">
                        {caption}
                    </p>
                )}

                {/* Audio & Views Row */}
                <div className="flex items-center gap-3 mt-0.5">
                    {/* Song / Audio */}
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[10px] text-white/80 animate-spin-slow">🎵</span>
                        <span className="text-[10px] font-medium text-white/80 truncate max-w-[120px]">
                            Original Sound • {username}
                        </span>
                    </div>
                    {/* View Count */}
                    <div className="flex items-center gap-1 text-white/60">
                        <span className="text-[10px]">👁️</span>
                        <span className="text-[10px] font-medium">{formatNumber(localViews)}</span>
                    </div>
                </div>

                {/* SHOP BUTTON (Compact Pill) */}
                <Link
                    href={`/marketplace?vendor=${vendorClerkId || ''}`}
                    className="mt-1 px-4 py-2 bg-[#39FF14] hover:bg-[#32d911] text-black font-black text-[10px] uppercase tracking-wider rounded-full shadow-[0_4px_15px_rgba(57,255,20,0.3)] transition-all active:scale-95 flex items-center gap-1.5"
                >
                    <span className="text-xs">🛍️</span>
                    Visit Shop
                </Link>
            </div>
        </div>
    );
}
