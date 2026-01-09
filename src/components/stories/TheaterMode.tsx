'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

interface Story {
    id: string;
    videoUrl: string;
    title?: string;
    vendor: {
        name: string;
        clerkId: string;
    };
    likes: number;
}

interface TheaterModeProps {
    stories: Story[];
    initialIndex: number;
    onClose: () => void;
}

export default function TheaterMode({ stories, initialIndex, onClose }: TheaterModeProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isMobile, setIsMobile] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    // Device detection
    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Keyboard navigation (TikTok Style: Up/Down)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowUp' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
            if (e.key === 'ArrowDown' && currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, stories.length, onClose]);

    const onTouchStartHandler = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientY);
    };

    const onTouchMoveHandler = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY);
    };

    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isSwipeUp = distance > minSwipeDistance;
        const isSwipeDown = distance < -minSwipeDistance;

        if (isSwipeUp && currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
        if (isSwipeDown && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const currentStory = stories[currentIndex];

    if (isMobile) {
        // Mobile: Full-screen TikTok style with Vertical Swipe
        return (
            <div
                className="fixed inset-0 bg-black z-[100]"
                onTouchStart={onTouchStartHandler}
                onTouchMove={onTouchMoveHandler}
                onTouchEnd={onTouchEndHandler}
            >
                <VideoPlayer
                    storyId={currentStory.id}
                    src={currentStory.videoUrl}
                    isActive={true}
                    username={currentStory.vendor?.name || 'User'}
                    caption={currentStory.title}
                    likes={currentStory.likes}
                    vendorClerkId={currentStory.vendor?.clerkId}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="fixed top-6 left-6 z-[110] w-12 h-12 rounded-full glass-strong border-2 border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                    <span className="text-white text-2xl">✕</span>
                </button>

                {/* Visual Hint for Swipe (Optional, shows briefly or if first time) */}
                <div className="fixed bottom-32 right-4 z-[50] pointer-events-none opacity-50 flex flex-col items-center animate-bounce">
                    <span className="text-white text-xs font-bold uppercase tracking-widest mb-2 writing-vertical-rl">Swipe</span>
                    <span className="text-white text-xl">↕</span>
                </div>
            </div>
        );
    }

    // Desktop: TikTok style with centered video and vertical controls
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 z-[110] w-14 h-14 rounded-full glass-strong border-2 border-[#39FF14]/30 flex items-center justify-center hover:scale-110 hover:border-[#39FF14] active:scale-95 transition-all omni-glow"
            >
                <span className="text-[#39FF14] text-2xl font-black">✕</span>
            </button>

            {/* Main Content */}
            <div className="flex items-center justify-center gap-8 max-w-7xl w-full h-full relative">

                {/* Previous Story (Up Arrow) - Positioned Left or Top? Keeping side for layout balance but changing Icon */}
                {currentIndex > 0 && (
                    <button
                        onClick={() => setCurrentIndex(currentIndex - 1)}
                        className="w-14 h-14 rounded-full glass-strong border-2 border-white/20 flex items-center justify-center hover:scale-110 hover:border-[#39FF14] active:scale-95 transition-all"
                        title="Previous (Up Arrow)"
                    >
                        <span className="text-white text-2xl">↑</span>
                    </button>
                )}

                {/* Video Container */}
                <div className="relative w-full max-w-[500px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl">
                    <VideoPlayer
                        storyId={currentStory.id}
                        src={currentStory.videoUrl}
                        isActive={true}
                        username={currentStory.vendor?.name || 'User'}
                        caption={currentStory.title}
                        likes={currentStory.likes}
                        vendorClerkId={currentStory.vendor?.clerkId}
                    />
                </div>

                {/* Next Story (Down Arrow) */}
                {currentIndex < stories.length - 1 && (
                    <button
                        onClick={() => setCurrentIndex(currentIndex + 1)}
                        className="w-14 h-14 rounded-full glass-strong border-2 border-white/20 flex items-center justify-center hover:scale-110 hover:border-[#39FF14] active:scale-95 transition-all"
                        title="Next (Down Arrow)"
                    >
                        <span className="text-white text-2xl">↓</span>
                    </button>
                )}
            </div>

            {/* Story Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 glass-strong rounded-full border border-white/10">
                <span className="text-white text-sm font-black">
                    {currentIndex + 1} / {stories.length}
                </span>
            </div>

            {/* Keyboard Hints */}
            <div className="absolute bottom-8 right-8 flex gap-2">
                <div className="px-3 py-2 glass-subtle rounded-lg border border-white/10">
                    <span className="text-white/40 text-xs font-bold">ESC to close</span>
                </div>
                <div className="px-3 py-2 glass-subtle rounded-lg border border-white/10">
                    <span className="text-white/40 text-xs font-bold">↑ ↓ to navigate</span>
                </div>
            </div>
        </div>
    );
}
