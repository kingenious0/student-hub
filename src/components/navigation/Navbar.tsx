// src/components/navigation/Navbar.tsx
'use client';

import Link from 'next/link';
import { UNIVERSITY_REGISTRY } from '@/lib/geo/distance';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useCart } from '@/context/CartContext';
import {
    MenuIcon,
    XIcon,
    ShoppingCartIcon,
    SearchIcon,
    MapPinIcon,
    ChevronRightIcon,
    StoreIcon,
    HeartIcon,
    PackageIcon,
    ZapIcon,
    UserCircleIcon
} from '@/components/ui/Icons';

export default function Navbar() {
    const pathname = usePathname();
    const { user, isLoaded: clerkLoaded } = useUser();
    const { getItemCount } = useCart();
    const [dbUser, setDbUser] = useState<{ role: string; vendorStatus: string; isRunner: boolean; onboarded: boolean; university?: string } | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [globalNotice, setGlobalNotice] = useState<string | null>(null);

    useEffect(() => {
        // Fetch User
        if (clerkLoaded && user) {
            fetch('/api/users/me')
                .then(res => res.json())
                .then(data => setDbUser(data))
                .catch(() => setDbUser(null));
        } else if (clerkLoaded && !user) {
            setDbUser(null);
        }

        // Poll Global Settings (Ticker) - Instant Sync
        const fetchTicker = () => {
            fetch('/api/system/config')
                .then(res => res.json())
                .then(data => setGlobalNotice(data?.globalNotice || null))
                .catch(() => setGlobalNotice(null));
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 3000); // 3 seconds for "Instant" feel

        return () => clearInterval(interval);
    }, [clerkLoaded, user]); // Removed pathname to avoid re-mounting interval purely on nav change

    // Close drawer on path change and Keyboard Shortcuts
    useEffect(() => {
        setIsDrawerOpen(false);

        const handleKeyDown = (e: KeyboardEvent) => {
            // Shortcut: Shift + Alt + Z (Command Center Z)
            if (e.shiftKey && e.altKey && e.key === 'Z') {
                if (user?.publicMetadata?.role === 'GOD_MODE') {
                    window.location.href = '/command-center-z';
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pathname, user]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isDrawerOpen]);

    const isActive = (path: string) => pathname === path;

    // Parse Color from Global Notice: [#ff0000]Message
    let tickerMessage = globalNotice;
    let tickerColor = '#39FF14'; // Default Omni Green

    if (globalNotice?.startsWith('[')) {
        const match = globalNotice.match(/^\[(#[a-fA-F0-9]{6}|[a-z]+)\](.*)/);
        if (match) {
            tickerColor = match[1];
            tickerMessage = match[2];
        }
    }

    // Only hide navbar on Command Center
    if (pathname?.startsWith('/command-center-z')) {
        return null;
    }

    return (
        <>
            <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-surface-border shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center px-4 h-16 max-w-7xl mx-auto">
                    {/* ... (Existing Logo etc) */}

                    {/* LEFT: Mobile Hamburger / Desktop Logo */}
                    <div className="flex items-center gap-4">
                        {/* Hamburger Trigger (Mobile Only) */}
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="lg:hidden p-1 hover:bg-surface rounded-lg transition-colors"
                            aria-label="Open Menu"
                        >
                            <MenuIcon className="w-6 h-6 text-foreground" />
                        </button>

                        {/* Logo - Ghost Trigger */}
                        <div
                            onClick={(e) => {
                                // Triple Click Logic
                                const now = Date.now();
                                const lastClick = (window as any).lastGhostClick || 0;
                                const clicks = (window as any).ghostClicks || 0;

                                if (now - lastClick < 500) { // 500ms between clicks
                                    (window as any).ghostClicks = clicks + 1;
                                } else {
                                    (window as any).ghostClicks = 1;
                                }
                                (window as any).lastGhostClick = now;

                                if ((window as any).ghostClicks >= 3) {
                                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                                    window.location.href = '/command-center-z';
                                    (window as any).ghostClicks = 0;
                                }
                            }}
                            className="flex items-center gap-2 group flex-shrink-0 cursor-pointer select-none"
                        >
                            <img
                                src="/OMNI-LOGO.ico"
                                alt="OMNI"
                                className="h-10 lg:h-12 w-auto transition-transform group-hover:scale-110 invert-on-light"
                            />
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center gap-1 ml-4">
                            <SignedIn>
                                <div id="omni-nav-marketplace">
                                    <NavLink href="/marketplace" isActive={isActive('/marketplace')}>
                                        🛍️ Marketplace
                                    </NavLink>
                                </div>
                                <NavLink href="/orders" isActive={isActive('/orders')}>
                                    📦 My Orders
                                </NavLink>
                                <div id="omni-nav-pulse">
                                    <NavLink href="/stories" isActive={isActive('/stories')}>
                                        📱 Campus Pulse
                                    </NavLink>
                                </div>
                                <NavLink href="/stories/my-pulse" isActive={isActive('/stories/my-pulse')}>
                                    📹 My Pulse
                                </NavLink>

                                <div id="omni-nav-runner">
                                    <NavLink href="/runner" isActive={isActive('/runner')}>
                                        🏃 Runner Mode
                                    </NavLink>
                                </div>
                            </SignedIn>
                        </div>
                    </div>

                    {/* RIGHT: Actions (Search, Cart, Profile) */}
                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Search Icon (Mobile/Desktop) - Expandable logic could go here */}
                        <Link href="/search" className="p-2 text-foreground/60 hover:text-primary transition-colors">
                            <SearchIcon className="w-6 h-6" />
                        </Link>

                        <ThemeToggle />

                        <SignedIn>
                            {/* Desktop: Text Role */}
                            <span className="hidden lg:block text-xs font-black text-foreground/40 uppercase tracking-widest">
                                {dbUser?.role || 'STUDENT'}
                            </span>

                            {/* Cart Icon */}
                            <Link
                                href="/cart"
                                className="relative p-2 text-foreground hover:text-primary transition-colors group"
                            >
                                <ShoppingCartIcon className="w-6 h-6 group-hover:scale-110 transition-transform block" />
                                {getItemCount() > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                        <span className="text-[10px] font-black text-white">{getItemCount()}</span>
                                    </div>
                                )}
                            </Link>

                            {/* Desktop: User Avatar */}
                            <div className="hidden lg:block" id="omni-nav-profile">
                                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-surface-border" } }} />
                            </div>
                        </SignedIn>

                        <SignedOut>
                            <SignInButton mode="modal">
                                <button id="omni-nav-signin" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest transition-all omni-glow active:scale-95">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>

                {/* GLOBAL TICKER */}
                {tickerMessage && (
                    <div style={{ backgroundColor: tickerColor }} className="text-black overflow-hidden h-6 flex items-center relative transition-colors duration-500">
                        <div className="animate-marquee whitespace-nowrap font-black text-xs uppercase tracking-[0.2em] flex gap-8 w-full absolute pt-1">
                            <span>📢 {tickerMessage}</span>
                            <span>📢 {tickerMessage}</span>
                            <span>📢 {tickerMessage}</span>
                            <span>📢 {tickerMessage}</span>
                        </div>
                    </div>
                )}
            </nav>

            {/* HAMBURGER DRAWER (Mobile) */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-background border-r border-surface-border z-[70] overflow-y-auto lg:hidden shadow-2xl"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 bg-gradient-to-br from-primary/20 to-surface border-b border-surface-border">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 overflow-hidden bg-surface flex items-center justify-center">
                                        <SignedIn>
                                            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-full h-full" } }} />
                                        </SignedIn>
                                        <SignedOut>
                                            <UserCircleIcon className="w-full h-full text-foreground/20 p-2" />
                                        </SignedOut>
                                    </div>
                                    <button
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="p-2 hover:bg-black/10 rounded-full transition-colors"
                                    >
                                        <XIcon className="w-6 h-6 text-foreground" />
                                    </button>
                                </div>
                                <SignedIn>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
                                        Hello, {user?.firstName || 'Student'}
                                    </h2>
                                    <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest mt-1">
                                        {dbUser?.role || 'Member'} • {dbUser?.onboarded ? 'Verified' : 'Guest'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 bg-surface/50 p-2 rounded-lg w-fit border border-surface-border/50">
                                        <MapPinIcon className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-bold text-foreground/80 uppercase tracking-wide">
                                            {dbUser?.university && UNIVERSITY_REGISTRY[dbUser.university as keyof typeof UNIVERSITY_REGISTRY]
                                                ? UNIVERSITY_REGISTRY[dbUser.university as keyof typeof UNIVERSITY_REGISTRY].name
                                                : (dbUser?.university || 'Select Campus')}
                                        </span>
                                    </div>
                                </SignedIn>
                                <SignedOut>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
                                        Hello, Guest
                                    </h2>
                                    <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest mt-1">
                                        Join the marketplace today
                                    </p>
                                    <div className="mt-4">
                                        <SignInButton mode="modal">
                                            <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
                                                Sign In / Sign Up
                                            </button>
                                        </SignInButton>
                                    </div>
                                </SignedOut>
                            </div>

                            {/* Drawer Links */}
                            <div className="p-4 space-y-2">
                                <SignedIn>
                                    {/* HUSTLE SWITCH (Dual Mode) */}
                                    <div className="mb-6 p-1">
                                        <Link
                                            href={dbUser?.role === 'VENDOR' ? "/dashboard/vendor" : "/become-vendor"}
                                            onClick={() => setIsDrawerOpen(false)}
                                            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-background to-surface border border-primary/30 rounded-2xl shadow-lg relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-[#39FF14] flex items-center justify-center text-black">
                                                    <StoreIcon className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-foreground uppercase tracking-widest">
                                                        {dbUser?.role === 'VENDOR' ? 'Vendor Mode' : 'Become a Vendor'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">
                                                        {dbUser?.role === 'VENDOR' ? 'Switch to Dashboard' : 'Start Selling Today'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRightIcon className="w-5 h-5 text-foreground/40" />
                                        </Link>
                                    </div>

                                    {/* RUNNER SWITCH - Only for Non-Vendors */}
                                    {dbUser?.role !== 'VENDOR' && (
                                        <div className="mb-6 p-1 -mt-4">
                                            <Link
                                                href={dbUser?.isRunner ? "/runner" : "/onboarding/runner"}
                                                onClick={() => setIsDrawerOpen(false)}
                                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-background to-surface border border-yellow-500/30 rounded-2xl shadow-lg relative overflow-hidden group"
                                            >
                                                <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black">
                                                        <ZapIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-foreground uppercase tracking-widest">
                                                            {dbUser?.isRunner ? 'Runner Mode' : 'Become a Runner'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">
                                                            {dbUser?.isRunner ? 'Active Missions' : 'Earn on Campus'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRightIcon className="w-5 h-5 text-foreground/40 group-hover:translate-x-1 transition-transform relative z-10" />
                                            </Link>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-3 px-2">
                                            Shop & Save
                                        </h3>
                                        <DrawerLink href="/marketplace" icon={<StoreIcon className="w-5 h-5" />} label="Marketplace" setIsOpen={setIsDrawerOpen} active={isActive('/marketplace')} />
                                        <DrawerLink href="/cart" icon={<ShoppingCartIcon className="w-5 h-5" />} label="My Cart" setIsOpen={setIsDrawerOpen} badge={getItemCount()} active={isActive('/cart')} />
                                        <DrawerLink href="/orders" icon={<PackageIcon className="w-5 h-5" />} label="My Orders" setIsOpen={setIsDrawerOpen} active={isActive('/orders')} />
                                        <DrawerLink href="/wishlist" icon={<HeartIcon className="w-5 h-5" />} label="Wishlist" setIsOpen={setIsDrawerOpen} />
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-3 px-2">
                                            Community
                                        </h3>
                                        <DrawerLink href="/stories" icon={<ZapIcon className="w-5 h-5 text-yellow-500" />} label="Campus Pulse" setIsOpen={setIsDrawerOpen} live={true} active={isActive('/stories')} />
                                        <DrawerLink href="/stories/my-pulse" icon={<div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black">MP</div>} label="My Pulse" setIsOpen={setIsDrawerOpen} active={isActive('/stories/my-pulse')} />
                                    </div>

                                    {/* Specialized Modes */}
                                    {(dbUser?.role === 'VENDOR' || dbUser?.role === 'ADMIN') && (
                                        <div className="mb-6 p-4 bg-surface rounded-2xl border border-surface-border">
                                            <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-3">
                                                Business Terminal
                                            </h3>
                                            {dbUser?.role === 'VENDOR' && (
                                                <DrawerLink href="/dashboard/vendor" icon={<StoreIcon className="w-5 h-5 text-[#39FF14]" />} label="Vendor Dashboard" setIsOpen={setIsDrawerOpen} active={isActive('/dashboard/vendor')} className="text-[#39FF14]" />
                                            )}
                                            {dbUser?.role === 'ADMIN' && (
                                                <DrawerLink href="/dashboard/admin" icon={<ZapIcon className="w-5 h-5 text-red-500" />} label="Admin Command" setIsOpen={setIsDrawerOpen} active={isActive('/dashboard/admin')} className="text-red-500" />
                                            )}
                                        </div>
                                    )}

                                    {dbUser?.isRunner && (
                                        <div className="mb-6 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">
                                                Earn Money
                                            </h3>
                                            <DrawerLink href="/runner" icon={<PackageIcon className="w-5 h-5 text-blue-500" />} label="Runner Dashboard" setIsOpen={setIsDrawerOpen} active={isActive('/runner')} />
                                        </div>
                                    )}

                                </SignedIn>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// Sub-components
function NavLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${isActive
                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                : 'text-foreground/60 hover:bg-surface hover:text-primary'
                }`}
        >
            {children}
        </Link>
    );
}

function DrawerLink({ href, icon, label, setIsOpen, active, badge, live, className }: any) {
    return (
        <Link
            href={href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-surface border border-surface-border shadow-sm' : 'hover:bg-surface/50'} ${className}`}
        >
            <div className="flex items-center gap-4">
                <span className={`text-foreground/60 ${active ? 'text-foreground' : ''}`}>{icon}</span>
                <span className={`font-bold text-sm uppercase tracking-tight ${active ? 'text-foreground' : 'text-foreground/70'}`}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {live && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase rounded animate-pulse">LIVE</span>
                )}
                {badge > 0 && (
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full">{badge}</span>
                )}
                <ChevronRightIcon className="w-4 h-4 text-foreground/20" />
            </div>
        </Link>
    );
}
