'use client';

import { useState, useEffect, Suspense } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import StoriesFeed from '@/components/marketplace/StoriesFeed';
import MaintenanceGuard from '@/components/admin/MaintenanceGuard';
import HorizontalHubs from '@/components/marketplace/HorizontalHubs';
import SmartFeed from '@/components/marketplace/SmartFeed';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import RefreshButton from '@/components/ui/RefreshButton';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
    const [isGhostAdmin, setIsGhostAdmin] = useState(false);
    const [isHybridAuth, setIsHybridAuth] = useState(false);

    useEffect(() => {
        checkSystemStatus();
        const ghost = localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true';
        if (ghost) setIsGhostAdmin(true);

        // Check for Native Session Sync manually (no external deps)
        const isVerified = document.cookie.split('; ').some(c => c.startsWith('OMNI_IDENTITY_VERIFIED=TRUE'));
        if (isVerified) {
            setIsHybridAuth(true);
        }
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
        <MaintenanceGuard protocol="MARKET">
            <div className="min-h-screen bg-background transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 pt-32 pb-8">

                    {maintenanceMode ? (
                        <div className="bg-red-500/10 border-2 border-red-500/20 rounded-[3rem] p-24 text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
                            <div className="relative z-10">
                                <h2 className="text-5xl font-black text-red-500 uppercase tracking-tighter mb-6">SYSTEM LOCKDOWN ACTIVE</h2>
                                <p className="text-xl font-bold text-red-400 mb-8 max-w-2xl mx-auto">
                                    THE MARKETPLACE IS CURRENTLY OFFLINE FOR SCHEDULED MAINTENANCE AND UPGRADES.
                                    ALL TRADING HAS BEEN HALTED.
                                </p>
                                <div className="inline-block px-6 py-2 bg-red-500 text-white font-black rounded-lg animate-pulse">
                                    STATUS: CRITICAL UPDATES IN PROGRESS
                                </div>
                            </div>
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent"></div>
                        </div>
                    ) : (
                        <>
                            {/* Header Section */}
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h1 className="text-sm font-bold tracking-widest text-foreground/30 uppercase">
                                        OMNI MARKET <span className="text-primary">•</span> DISCOVERY
                                    </h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RefreshButton />
                                    <ThemeSwitcher />
                                </div>
                            </div>

                            {/* Campus Pulse (Stories) */}
                            <div className="mb-8">
                                <StoriesFeed />
                            </div>

                            {/* Authentication Check */}
                            <SignedOut>
                                {!isGhostAdmin && !isHybridAuth && (
                                    <div className="bg-surface border border-surface-border rounded-[2.5rem] p-12 text-center relative overflow-hidden mb-12">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                                        <h2 className="text-3xl font-black text-foreground mb-6 uppercase tracking-tight relative z-10">
                                            Authentication Required
                                        </h2>
                                        <p className="text-foreground/60 mb-8 max-w-md mx-auto relative z-10">
                                            Sign in to access personalized recommendations and start trading.
                                        </p>
                                        <div className="relative z-10">
                                            <SignInButton mode="modal">
                                                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                                                    Access Student Hub
                                                </button>
                                            </SignInButton>
                                        </div>
                                    </div>
                                )}
                            </SignedOut>

                            {(isHybridAuth || isGhostAdmin) ? (
                                <>
                                    {isGhostAdmin && (
                                        <div className="mb-4 text-[10px] font-bold text-yellow-500 text-center uppercase tracking-widest animate-pulse">
                                            👻 Ghost Mode Active
                                        </div>
                                    )}
                                    {/* Sticky Hubs Bar */}
                                    <HorizontalHubs />

                                    {/* The Smart Feed */}
                                    <Suspense fallback={<div className="h-96 bg-surface/50 rounded-3xl animate-pulse" />}>
                                        <SmartFeed />
                                    </Suspense>
                                </>
                            ) : (
                                <SignedIn>
                                    {/* Authenticated View */}
                                    <HorizontalHubs />
                                    <Suspense fallback={<div className="h-96 bg-surface/50 rounded-3xl animate-pulse" />}>
                                        <SmartFeed />
                                    </Suspense>
                                </SignedIn>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MaintenanceGuard>
    );
}
