
'use client';

import { useState, useEffect, useRef } from 'react';
import VideoPlayer from '@/components/stories/VideoPlayer';
import Link from 'next/link';

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

export default function StoriesFeedPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
                    // Get story ID from data attribute
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
    }, [stories]); // Re-run when stories load

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground transition-colors duration-300">
                <div className="flex flex-col items-center">
                    <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Loading Campus Pulse...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="h-screen w-full bg-background text-foreground overflow-y-scroll snap-y snap-mandatory transition-colors duration-300"
            ref={containerRef}
            style={{ scrollBehavior: 'smooth' }}
        >
            {/* Header / Nav Overlay */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <h1 className="text-xl font-bold text-white drop-shadow-md pointer-events-auto">
                    Campus Pulse ⚡
                </h1>
                <Link
                    href="/stories/new"
                    className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-semibold text-sm hover:bg-white/30 transition pointer-events-auto"
                >
                    + New Post
                </Link>
            </div>

            {stories.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white p-6">
                    <div className="text-4xl mb-4">📹</div>
                    <h2 className="text-2xl font-bold mb-2">No Stories Yet</h2>
                    <p className="text-gray-400 text-center mb-6">
                        Be the first to share what&apos;s happening on campus!
                    </p>
                    <Link
                        href="/stories/new"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold"
                    >
                        Create Story
                    </Link>
                </div>
            ) : (
                stories.map((story) => (
                    <div
                        key={story.id}
                        data-story-id={story.id}
                        className="story-container w-full h-full snap-start relative"
                    >
                        <VideoPlayer
                            storyId={story.id}
                            src={story.videoUrl}
                            isActive={activeStoryId === story.id}
                            username={story.vendor?.name || 'User'}
                            caption={story.title}
                            likes={story.likes}
                            vendorClerkId={story.vendor?.clerkId}
                        />
                    </div>
                ))
            )}
        </div>
    );
}
