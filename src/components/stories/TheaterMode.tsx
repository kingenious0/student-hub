'use client';

import { useState, useEffect, useRef } from 'react';
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
    views: number;
}

interface TheaterModeProps {
    stories: Story[];
    initialIndex: number;
    onClose: () => void;
}

export default function TheaterMode({ stories, initialIndex, onClose }: TheaterModeProps) {
    const [activeStoryId, setActiveStoryId] = useState<string>(stories[initialIndex]?.id);
    const containerRef = useRef<HTMLDivElement>(null);
    const storyRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Scroll to initial index on mount
    useEffect(() => {
        if (stories[initialIndex]) {
            const element = storyRefs.current[stories[initialIndex].id];
            if (element) {
                element.scrollIntoView({ behavior: 'auto' });
            }
        }
    }, [initialIndex, stories]);

    // Intersection Observer for Auto-Play
    useEffect(() => {
        const options = {
            root: containerRef.current,
            threshold: 0.6, // 60% visibility required to be "active"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-story-id');
                    if (id) setActiveStoryId(id);
                }
            });
        }, options);

        Object.values(storyRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [stories]);

    return (
        <div className="fixed inset-0 bg-black z-[100] theater-mode">
            {/* Close Button - Fixed Overlay */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 z-[110] w-12 h-12 rounded-full glass-strong border-2 border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-white hover:border-[#39FF14] hover:text-[#39FF14] omni-glow"
            >
                ✕
            </button>

            {/* Vertical Scroll Container */}
            <div
                ref={containerRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
            >
                {stories.map((story) => (
                    <div
                        key={story.id}
                        data-story-id={story.id}
                        ref={(el) => { storyRefs.current[story.id] = el }}
                        className="w-full h-[100dvh] snap-start relative flex items-center justify-center bg-black"
                    >
                        {/* 
                           TikTok Style Container:
                           - Mobile: Full width
                           - Desktop: Max width 450px (Mobile aspect)
                        */}
                        <div className="w-full h-full md:max-w-[450px] relative md:py-8">
                            <div className="w-full h-full md:rounded-[2rem] overflow-hidden relative bg-gray-900 border-x border-white/5 md:border-2 md:glass-border">
                                <VideoPlayer
                                    key={story.id}
                                    storyId={story.id}
                                    src={story.videoUrl}
                                    isActive={activeStoryId === story.id}
                                    username={story.vendor?.name || 'User'}
                                    caption={story.title}
                                    likes={story.likes}
                                    views={story.views || 0}
                                    vendorClerkId={story.vendor?.clerkId}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
