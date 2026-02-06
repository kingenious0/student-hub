// src/components/navigation/Navbar.tsx
'use client';

import Link from 'next/link';
import { UNIVERSITY_REGISTRY } from '@/lib/geo/distance';
import { usePathname, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';
import { useCartStore } from '@/lib/store/cart';
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
    UserCircleIcon,
    ClockIcon
} from '@/components/ui/Icons';
import { Shield, Settings } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoaded: clerkLoaded } = useUser();
    const itemCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [dbUser, setDbUser] = useState<{ role: string; vendorStatus: string; isRunner: boolean; onboarded: boolean; university?: string } | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [globalNotice, setGlobalNotice] = useState<string | null>(null);

    // Triple-tap easter egg for Command Center
    const tapCountRef = useRef(0);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle logo click for triple-tap easter egg
    const handleLogoClick = (e: React.MouseEvent) => {
        const role = (user?.publicMetadata?.role as string)?.toUpperCase();
        const dbRole = dbUser?.role?.toUpperCase();

        const isAuthorized = role === 'GOD_MODE' || role === 'ADMIN' || dbRole === 'GOD_MODE' || dbRole === 'ADMIN';

        console.log('[LOGO_CLICK]', { isAuthorized, role, dbRole, tapCount: tapCountRef.current + 1 });

        if (!isAuthorized) return;

        // Prevent default only to handle it manually
        e.preventDefault();

        tapCountRef.current += 1;

        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
        }

        if (tapCountRef.current === 3) {
            if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
            tapCountRef.current = 0;
            router.push('/command-center-z');
            return;
        }

        // Reset count after 500ms of inactivity
        tapTimeoutRef.current = setTimeout(() => {
            const finalCount = tapCountRef.current;
            tapCountRef.current = 0;

            if (finalCount === 1) {
                // If only one tap was recorded, navigate home normally
                if (pathname !== '/') router.push('/');
            }
        }, 500);
    };

    useEffect(() => {
        if (clerkLoaded && user) {
            fetch('/api/users/me')
                .then(res => res.json())
                .then(data => setDbUser(data))
                .catch(() => setDbUser(null));
        } else if (clerkLoaded && !user) {
            setDbUser(null);
        }

        const fetchTicker = () => {
            fetch('/api/system/config')
                .then(res => res.json())
                .then(data => setGlobalNotice(data?.globalNotice || null))
                .catch(() => setGlobalNotice(null));
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 3000);

        return () => clearInterval(interval);
    }, [clerkLoaded, user]);

    useEffect(() => {
        setIsDrawerOpen(false);
        setIsMobileSearchOpen(false); // Close search on nav

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.shiftKey && e.altKey && e.key === 'Z') {
                const role = user?.publicMetadata?.role as string;
                // We need to access dbUser from state, but useEffect closure might capture old state.
                // However, since we depend on [pathname, user], it might not trigger often enough to capture dbUser updates if not added to deps.
                // Let's rely on the refetch or checking localStorage if we were persistent, 
                // but checking the publicMetadata is the safest sync way usually. 
                // Since this is a specialized tool, we can try to assume if they are pressing this Combo they know what they are doing.
                // But generally, let's keep it safe. 
                // *Self-Correction*: The keyboard handler closure will have stale `dbUser` if not in dependency array.
                // But adding dbUser to dependency array causes re-attaching listeners. That's fine.
            }
        };

        // We will define the handler inside loosely or use a Ref for current dbUser. 
        // For now, let's just use the logo click fix mostly, and for keydown let's try to be permissive 
        // OR fix the dependency (added dbUser below).

    }, [pathname, user]);

    // Better Keyboard Handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.shiftKey && e.altKey && e.key === 'Z') {
                const role = user?.publicMetadata?.role as string;
                const dbRole = dbUser?.role;

                if (role === 'GOD_MODE' || role === 'ADMIN' || dbRole === 'GOD_MODE' || dbRole === 'ADMIN') {
                    window.location.href = '/command-center-z';
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [user, dbUser]); // Added dbUser dependency

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
    let tickerColor = '#39FF14';

    if (globalNotice?.startsWith('[')) {
        const match = globalNotice.match(/^\[(#[a-fA-F0-9]{6}|[a-z]+)\](.*)/);
        if (match) {
            tickerColor = match[1];
            tickerMessage = match[2];
        }
    }

    if (pathname?.startsWith('/command-center-z')) {
        return null;
    }

    return (
        <>
            <nav id="omni-navbar" className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/90 border-b border-surface-border shadow-md transition-all duration-300">
                <div className="flex justify-between items-center px-4 h-16 max-w-7xl mx-auto gap-4">
                    {/* LEFT: Mobile Hamburger / Desktop Logo */}
                    <div className="flex items-center gap-4">
                        {/* Hamburger Trigger (Mobile Only) */}
                        <button
                            id="omni-mobile-menu"
                            onClick={() => setIsDrawerOpen(true)}
                            className="lg:hidden p-1 hover:bg-surface rounded-lg transition-colors"
                            aria-label="Open Menu"
                        >
                            <MenuIcon className="w-6 h-6 text-foreground" />
                        </button>

                        {/* Logo */}
                        {((user?.publicMetadata?.role as string)?.toUpperCase() === 'GOD_MODE' ||
                            (user?.publicMetadata?.role as string)?.toUpperCase() === 'ADMIN' ||
                            dbUser?.role?.toUpperCase() === 'GOD_MODE' ||
                            dbUser?.role?.toUpperCase() === 'ADMIN') ? (
                            <div
                                onClick={handleLogoClick}
                                className="flex items-center gap-2 group flex-shrink-0 cursor-pointer select-none"
                            >
                                <img
                                    src="/OMNI-LOGO.ico"
                                    alt="OMNI"
                                    className="h-14 w-auto transition-transform group-hover:scale-110 invert-on-light"
                                    style={{ filter: 'var(--invert-filter)' }}
                                />
                                <span className="hidden lg:block font-black tracking-tighter text-lg">OMNI</span>
                            </div>
                        ) : (
                            <Link href="/" className="flex items-center gap-2 group flex-shrink-0 cursor-pointer select-none">
                                <img
                                    src="/OMNI-LOGO.ico"
                                    alt="OMNI"
                                    className="h-14 w-auto transition-transform group-hover:scale-110 invert-on-light"
                                    style={{ filter: 'var(--invert-filter)' }}
                                />
                                <span className="hidden lg:block font-black tracking-tighter text-lg">OMNI</span>
                            </Link>
                        )}
                    </div>



                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">


                        <ThemeToggle />

                        <SignedIn>
                            <div className="hidden lg:flex items-center gap-4 mr-2">
                                <Link href="/" className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">Market</Link>
                                <Link href="/orders" className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">Orders</Link>
                            </div>

                            <Link
                                href="/cart"
                                className="relative p-2 text-foreground hover:text-primary transition-colors group"
                            >
                                <ShoppingCartIcon className="w-6 h-6 group-hover:scale-110 transition-transform block" />
                                {mounted && itemCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                        <span className="text-[10px] font-black text-white">{itemCount}</span>
                                    </div>
                                )}
                            </Link>

                            <div className="hidden lg:block" id="omni-nav-profile">
                                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-surface-border" } }}>
                                    <UserButton.MenuItems>
                                        <UserButton.Link
                                            label="OMNI Security Hub"
                                            labelIcon={<Shield className="w-4 h-4" />}
                                            href="/security-setup"
                                        />
                                        <UserButton.Link
                                            label="Account Settings"
                                            labelIcon={<Settings className="w-4 h-4" />}
                                            href="/settings"
                                        />
                                    </UserButton.MenuItems>
                                </UserButton>
                            </div>
                        </SignedIn>

                        <SignedOut>
                            <Link href="/sign-in" id="omni-nav-signin" className="hidden md:block px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest transition-all omni-glow active:scale-95">
                                Sign In
                            </Link>
                            <Link href="/sign-in" className="md:hidden p-2 bg-primary/10 text-primary rounded-lg">
                                <UserCircleIcon className="w-5 h-5" />
                            </Link>
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
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            id="omni-drawer"
                            className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-background border-r border-surface-border z-[70] overflow-y-auto lg:hidden shadow-2xl"
                        >
                            {/* Drawer Content */}
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
                                    <div className="mt-4">
                                        <Link href="/sign-in" className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest shadow-lg block text-center" onClick={() => setIsDrawerOpen(false)}>
                                            Sign In / Sign Up
                                        </Link>
                                    </div>
                                </SignedOut>
                            </div>

                            <div className="p-4 space-y-2">
                                <SignedIn>
                                    {/* HUSTLE: VENDOR */}
                                    <div className="mb-6 p-1">
                                        <Link
                                            href={dbUser?.role === 'VENDOR' ? "/dashboard/vendor" : "/become-vendor"}
                                            onClick={() => setIsDrawerOpen(false)}
                                            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-background to-surface border border-primary/30 rounded-2xl shadow-lg relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black ${dbUser?.vendorStatus === 'PENDING' ? 'bg-yellow-500' : 'bg-[#39FF14]'}`}>
                                                    {dbUser?.vendorStatus === 'PENDING' ? <ClockIcon className="w-5 h-5" /> : <StoreIcon className="w-5 h-5" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-foreground uppercase tracking-widest">
                                                        {dbUser?.role === 'VENDOR' ? 'Vendor Mode' : (dbUser?.vendorStatus === 'PENDING' ? 'Application Pending' : 'Become a Vendor')}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRightIcon className="w-5 h-5 text-foreground/40" />
                                        </Link>
                                    </div>

                                    {/* HUSTLE: RUNNER */}
                                    {dbUser?.role !== 'VENDOR' && (
                                        <div className="mb-6 p-1 -mt-4">
                                            <Link
                                                href={dbUser?.isRunner ? "/runner" : "/runner"}
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
                                                    </div>
                                                </div>
                                                <ChevronRightIcon className="w-5 h-5 text-foreground/40" />
                                            </Link>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-3 px-2">
                                            Shop & Save
                                        </h3>
                                        <DrawerLink href="/" icon={<StoreIcon className="w-5 h-5" />} label="Marketplace" setIsOpen={setIsDrawerOpen} active={isActive('/')} />
                                        <DrawerLink href="/cart" icon={<ShoppingCartIcon className="w-5 h-5" />} label="My Cart" setIsOpen={setIsDrawerOpen} badge={itemCount} active={isActive('/cart')} />
                                        <DrawerLink href="/orders" icon={<PackageIcon className="w-5 h-5" />} label="My Orders" setIsOpen={setIsDrawerOpen} active={isActive('/orders')} />
                                        <DrawerLink href="/security-setup" icon={<Shield className="w-5 h-5 text-blue-500" />} label="OMNI Security" setIsOpen={setIsDrawerOpen} active={isActive('/security-setup')} />
                                        <DrawerLink href="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" setIsOpen={setIsDrawerOpen} active={isActive('/settings')} />
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

                                </SignedIn>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function DrawerLink({ href, icon, label, setIsOpen, active, badge, live, className, id, comingSoon }: any) {
    if (comingSoon) return null; // Simplified
    return (
        <Link
            id={id}
            href={href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-surface border border-surface-border shadow-sm' : 'hover:bg-surface/50'} ${className}`}
        >
            <div className="flex items-center gap-4">
                <span className={`text-foreground/60 ${active ? 'text-foreground' : ''}`}>{icon}</span>
                <span className={`font-bold text-sm uppercase tracking-tight ${active ? 'text-foreground' : 'text-foreground/70'}`}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {live && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase rounded animate-pulse">LIVE</span>}
                {badge > 0 && <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full">{badge}</span>}
                <ChevronRightIcon className="w-4 h-4 text-foreground/20" />
            </div>
        </Link>
    );
}
