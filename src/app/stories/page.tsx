'use client';

import { useState, useEffect, useRef } from 'react';
import VideoPlayer from '@/components/stories/VideoPlayer';
import TheaterMode from '@/components/stories/TheaterMode';
import Link from 'next/link';
import { useAdmin } from '@/context/AdminContext';
import ProtocolGuard from '@/components/admin/ProtocolGuard';

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

export default function StoriesFeedPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
    const [theaterOpen, setTheaterOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isFeatureEnabled } = useAdmin();

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch('/api/stories');
                if (res.ok) {
                    const data = await res.json();
                    setStories(data.stories);
                    if (data.stories.length > 0) {
                        setActiveStoryId(data.stories[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch stories', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    // Intersection Observer to detect which video is in view
    useEffect(() => {
        const options = {
            root: containerRef.current,
            threshold: 0.6, // 60% of the video must be visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const storyId = entry.target.getAttribute('data-story-id');
                    if (storyId) {
                        setActiveStoryId(storyId);
                    }
                }
            });
        }, options);

        const elements = document.querySelectorAll('.story-container');
        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
        };
    }, [stories]);


    return (
        <ProtocolGuard protocol="PULSE">
            <div className="relative">
                {loading ? (
                    <div className="flex items-center justify-center min-h-screen bg-black text-white">
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin mb-4 omni-glow"></div>
                            <p className="text-[#39FF14] font-black uppercase tracking-[0.4em] text-[10px]">Loading Campus Pulse...</p>
                        </div>
                    </div>
                ) : stories.length === 0 ? (
                    /* Empty State */
                    <div className="h-screen flex flex-col items-center justify-center text-white p-6 bg-gradient-to-br from-black via-gray-900 to-black">
                        <div className="glass-strong rounded-[3rem] p-12 max-w-md text-center">
                            <div className="text-7xl mb-6 animate-float">📹</div>
                            <h2 className="text-3xl font-black mb-4 uppercase tracking-tight gradient-text">No Stories Yet</h2>
                            <p className="text-white/60 text-sm mb-8 leading-relaxed">
                                Be the first to share what's happening on campus! Create a story and let students know about your products.
                            </p>
                            {isFeatureEnabled('PULSE') && (
                                <Link
                                    href="/stories/my-pulse"
                                    className="inline-block px-8 py-4 bg-gradient-to-r from-[#39FF14] to-[#2ecc71] text-black font-black rounded-2xl uppercase tracking-wider hover:scale-105 active:scale-95 transition-all omni-glow-strong"
                                >
                                    Create Story
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Automatic Theater Mode */
                    <TheaterMode
                        stories={stories}
                        initialIndex={0}
                        onClose={() => window.history.back()}
                    />
                )}
            </div>
        </ProtocolGuard>
    );
}
