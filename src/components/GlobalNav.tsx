'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalNav() {
    const pathname = usePathname();
    const { user } = useUser();
    const [isGhostAdmin, setIsGhostAdmin] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const ghost = localStorage.getItem('LH_GOD_MODE_UNLOCKED') === 'true';
        setIsGhostAdmin(ghost);
    }, []);

    // Don't show nav on certain pages
    const hideNav = pathname?.includes('/command-center-z') || pathname?.includes('/onboarding');
    if (hideNav) return null;

    const navItems = [
        { label: 'Market', href: '/', icon: '🏪' },
        { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    ];

    // Add admin-only nav item
    if (isGhostAdmin) {
        navItems.push({ label: 'Command', href: '/command-center-z', icon: '⚡' });
    }

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-surface-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-xl font-black uppercase tracking-tighter text-foreground">
                                    LaHustle
                                </h1>
                                <p className="text-[8px] text-foreground/40 font-bold uppercase tracking-widest">
                                    Student Hub
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Nav Items */}
                        <div className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-foreground/60 hover:text-foreground hover:bg-surface'
                                            }`}
                                    >
                                        <span className="mr-2">{item.icon}</span>
                                        {item.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-primary rounded-xl -z-10"
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="hidden md:flex items-center gap-3">
                            {user && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-surface-border">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-black text-primary-foreground">
                                        {user.firstName?.[0] || 'U'}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-foreground">
                                            {user.firstName || 'User'}
                                        </p>
                                        <p className="text-[9px] text-foreground/40 uppercase tracking-wider">
                                            {isGhostAdmin ? 'Admin' : 'Student'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-surface-border"
                        >
                            <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-0 right-0 z-40 md:hidden bg-background border-b border-surface-border"
                    >
                        <div className="p-4 space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-foreground/60 hover:text-foreground hover:bg-surface'
                                            }`}
                                    >
                                        <span className="mr-2">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}

                            {/* User Info in Mobile */}
                            {user && (
                                <div className="mt-4 pt-4 border-t border-surface-border">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-lg font-black text-primary-foreground">
                                            {user.firstName?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">
                                                {user.firstName || 'User'}
                                            </p>
                                            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                                                {isGhostAdmin ? 'Admin' : 'Student'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer to prevent content from going under fixed nav */}
            <div className="h-20"></div>
        </>
    );
}
