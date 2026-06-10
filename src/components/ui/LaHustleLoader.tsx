
'use client';

import React from 'react';
import { Skeleton } from './Skeleton';

export default function LaHustleLoader() {
    const letters = 'LaHustle'.split('');

    return (
        <div className="fixed inset-0 z-[100] bg-background overflow-hidden flex flex-col transition-colors duration-300">
            {/* 1. SKELETON LAYOUT BACKGROUND */}
            <div className="w-full h-full flex flex-col pointer-events-none select-none opacity-40">
                {/* Navbar Skeleton */}
                <div className="w-full border-b border-border/40 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>

                {/* Main Content Skeleton Area */}
                <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-8">
                    {/* Banner Skeleton */}
                    <Skeleton className="w-full h-48 sm:h-64 rounded-2xl" />

                    {/* Category Tabs Skeleton */}
                    <div className="flex gap-3 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
                        ))}
                    </div>

                    {/* Grid of Cards Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="border border-border/30 rounded-2xl p-4 space-y-3 bg-surface/50">
                                <Skeleton className="aspect-square w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <Skeleton className="h-5 w-12" />
                                    <Skeleton className="h-7 w-16 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. OVERLAY GLASSMORPHISM AND SPLASH ANIMATION */}
            <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="relative flex flex-col items-center">
                    {/* Glowing Logo with Official Brand Mark */}
                    <div className="relative mb-8 flex items-center justify-center">
                        {/* Glow ring */}
                        <div className="absolute inset-0 w-40 h-20 mx-auto rounded-2xl bg-primary/20 blur-2xl" />
                        {/* Logo on white pill */}
                        <div className="relative bg-white rounded-2xl px-5 py-3 shadow-[0_0_40px_rgba(57,255,20,0.3)] border border-primary/30">
                            <img
                                src="/LaHustle-Original.png"
                                className="h-12 w-auto object-contain"
                                alt="LaHustle"
                                style={{ animationDuration: '2s' }}
                            />
                        </div>
                        {/* Orbiting bolt */}
                        <div className="absolute -top-2 -right-2 text-xl animate-spin" style={{ animationDuration: '8s' }}>⚡</div>
                    </div>

                    {/* Animated Waving Brand Name */}
                    <div className="flex space-x-1 mb-4 select-none">
                        {letters.map((char, index) => (
                            <span
                                key={index}
                                className="bounce-letter text-4xl sm:text-5xl font-black tracking-tight"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    color: char === 'L' || char === 'H' ? 'var(--primary)' : 'var(--foreground)',
                                    textShadow: char === 'L' || char === 'H' ? '0 0 15px var(--primary-glow)' : 'none'
                                }}
                            >
                                {char}
                            </span>
                        ))}
                    </div>

                    {/* Loader Subtitle */}
                    <div className="text-muted-foreground font-semibold text-[10px] uppercase tracking-[0.6em] pl-[0.6em] animate-pulse">
                        Setting up your marketplace
                    </div>

                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}

