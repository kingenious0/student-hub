'use client';

import { useState, useEffect, Suspense } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import StoriesFeed from '@/components/marketplace/StoriesFeed';
import NewReleases from '@/components/marketplace/NewReleases';
import BentoCategories from '@/components/marketplace/BentoCategories';
import { motion } from 'framer-motion';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string | null;
    hotspot: string | null;
    vendor: {
        id: string;
        name: string | null;
        isActive: boolean;
        currentHotspot: string | null;
    };
}

export default function MarketplacePage() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        checkSystemStatus();
    }, []);

    const checkSystemStatus = async () => {
        try {
            const res = await fetch('/api/system/config');
            const data = await res.json();
            if (data.success && data.maintenanceMode) {
                setMaintenanceMode(true);
            }
        } catch (error) {
            console.error('System status check failed');
        }
    };

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Subtle Breadcrumb Navigation */}
                <div className="mb-8">
                    <h1 className="text-sm font-bold tracking-widest text-foreground/30 uppercase mb-8">
                        OMNI ECOSYSTEM <span className="text-primary">/</span> MARKET
                    </h1>
                </div>

                {maintenanceMode ? (
                    <div className="bg-red-500/10 border-2 border-red-500/20 rounded-[3rem] p-24 text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
                        <div className="text-8xl mb-8">🚧</div>
                        <h2 className="text-5xl font-black text-red-500 uppercase tracking-tighter mb-4">SECTOR LOCKDOWN</h2>
                        <p className="text-foreground/40 font-black uppercase tracking-widest text-xs max-w-lg mx-auto leading-loose">
                            Global variables are being manipulated. All marketplace activities are suspended for system-wide maintenance. Please await uplink restoration.
                        </p>
                    </div>
                ) : (
                    <>
                        <SignedOut>
                            <div className="bg-surface border border-surface-border rounded-[2.5rem] p-12 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                                <h2 className="text-3xl font-black text-foreground mb-6 uppercase tracking-tight relative z-10">
                                    Authentication Required for Marketplace Access
                                </h2>
                                <SignInButton mode="modal">
                                    <button className="relative z-10 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all omni-glow active:scale-95">
                                        Initialize Session
                                    </button>
                                </SignInButton>
                            </div>
                        </SignedOut>

                        <SignedIn>
                            {/* Section 1: New Releases - 72 Hour Fresh Drops */}
                            <NewReleases />

                            {/* Section 2: Explore Categories - Gateway to Dedicated Pages */}
                            <BentoCategories />

                            {/* Section 3: Campus Pulse Snippets - Coming Soon */}
                            <div className="mt-24 mb-12">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                                    <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                                        CAMPUS PULSE
                                    </h2>
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                                </div>

                                <StoriesFeed />
                            </div>
                        </SignedIn>
                    </>
                )}
            </div>
        </div>
    );
}
