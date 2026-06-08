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
import { useWishlistStore } from '@/lib/store/wishlist';
import CartDrawer from './CartDrawer';
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
import { Shield, Settings, Tag, Bell } from 'lucide-react';
import { OmniLogo } from '@/components/ui/OmniLogo';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoaded: clerkLoaded } = useUser();
    const itemCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
    const wishlistCount = useWishlistStore((state) => state.items.length);
    const [mounted, setMounted] = useState(false);
    const [pendingOrderCount, setPendingOrderCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [dbUser, setDbUser] = useState<{ role: string; vendorStatus: string; onboarded: boolean; university?: string } | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
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
            useWishlistStore.getState().loadWishlist();
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
        const tickerInterval = setInterval(fetchTicker, 3000);

        return () => clearInterval(tickerInterval);
    }, [clerkLoaded, user]);

    // Fetch notification badge count
    useEffect(() => {
        if (!clerkLoaded || !user) return;
        const fetchNotifCount = async () => {
            try {
                const res = await fetch('/api/notifications/unread');
                if (res.ok) {
                    const data = await res.json();
                    setNotificationCount(data.count || 0);
                }
            } catch {}
        };
        fetchNotifCount();
        const interval = setInterval(fetchNotifCount, 20000);
        return () => clearInterval(interval);
    }, [clerkLoaded, user]);

    // Poll vendor pending order count (separate effect to avoid re-fetching dbUser)
    const prevRoleRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        const role = dbUser?.role;
        if (role !== 'VENDOR') {
            setPendingOrderCount(0);
            prevRoleRef.current = role;
            return;
        }
        if (prevRoleRef.current === role) return;
        prevRoleRef.current = role;

        const fetchPendingOrders = async () => {
            try {
                const res = await fetch('/api/vendor/orders');
                if (res.ok) {
                    const data = await res.json();
                    const orders = data.orders || [];
                    setPendingOrderCount(orders.filter((o: any) => o.status === 'PAID').length);
                }
            } catch {}
        };
        fetchPendingOrders();
        const interval = setInterval(fetchPendingOrders, 15000);
        return () => clearInterval(interval);
    }, [dbUser?.role]);

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

    if (
        pathname?.startsWith('/command-center-z') || 
        pathname?.startsWith('/sign-in') || 
        pathname?.startsWith('/sign-up') || 
        pathname?.startsWith('/onboarding') ||
        pathname?.startsWith('/verify') ||
        pathname?.startsWith('/security-setup')
    ) {
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
                            className="lg:hidden p-3 hover:bg-surface rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                            aria-label="Open Menu"
                        >
                            <MenuIcon className="w-6 h-6 text-foreground" />
                        </button>

                        {/* Logo */}
                        {((user?.publicMetadata?.role as string)?.toUpperCase() === 'GOD_MODE' ||
                            (user?.publicMetadata?.role as string)?.toUpperCase() === 'ADMIN' ||
                            dbUser?.role?.toUpperCase() === 'GOD_MODE' ||
                            dbUser?.role?.toUpperCase() === 'ADMIN') ? (
                            <div onClick={handleLogoClick} className="flex-shrink-0">
                                <OmniLogo size="md" showTagline={false} className="transition-transform hover:scale-110" />
                            </div>
                        ) : (
                            <Link href="/" className="flex-shrink-0">
                                <OmniLogo size="md" showTagline={false} className="transition-transform hover:scale-110" />
                            </Link>
                        )}
                    </div>



                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">


                        <ThemeToggle />

                        <SignedIn>
                            <div className="hidden lg:flex items-center gap-4 mr-2">
                                <Link href="/" className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">Market</Link>
                                <Link href="/services" className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">Services</Link>
                                <Link href="/orders" className="relative text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">
                                    Orders
                                    {dbUser?.role === 'VENDOR' && pendingOrderCount > 0 && (
                                        <span className="absolute -top-2 -right-4 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{pendingOrderCount}</span>
                                    )}
                                </Link>
                                <Link href="/wishlist" className="relative text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">
                                    Wishlist
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-2 -right-4 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-black rounded-full flex items-center justify-center">{wishlistCount}</span>
                                    )}
                                </Link>
                                {dbUser?.role === 'VENDOR' && (
                                    <Link 
                                        href="/dashboard/vendor" 
                                        className="relative text-xs font-black text-primary hover:text-primary/80 transition-all bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 uppercase tracking-wider"
                                    >
                                        🏪 Vendor Dashboard
                                        {pendingOrderCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center shadow-lg">
                                                {pendingOrderCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </div>

                            <Link
                                href="/notifications"
                                className="relative p-3 text-foreground hover:text-primary transition-colors group cursor-pointer bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                {mounted && notificationCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                        <span className="text-[10px] font-black text-white">{notificationCount > 99 ? '99+' : notificationCount}</span>
                                    </div>
                                )}
                            </Link>

                            <button
                                onClick={() => setCartDrawerOpen(true)}
                                className="relative p-3 text-foreground hover:text-primary transition-colors group cursor-pointer bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <ShoppingCartIcon className="w-6 h-6 group-hover:scale-110 transition-transform block" />
                                {mounted && itemCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                        <span className="text-[10px] font-black text-white">{itemCount}</span>
                                    </div>
                                )}
                            </button>

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
                            <Link href="/sign-in" id="omni-nav-signin" className="hidden md:block px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest transition-all omni-glow active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none">
                                Sign In
                            </Link>
                            <Link href="/sign-in" className="md:hidden p-2 bg-primary/10 text-primary rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none">
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
                                        className="p-3 hover:bg-black/10 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                        aria-label="Close menu"
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

                                </SignedIn>
                                <SignedOut>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
                                        Hello, Guest
                                    </h2>
                                    <div className="mt-4">
                                        <Link href="/sign-in" className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest shadow-lg block text-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none" onClick={() => setIsDrawerOpen(false)}>
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
                                                        {dbUser?.role === 'VENDOR' ? 'Vendor Dashboard' : (dbUser?.vendorStatus === 'PENDING' ? 'Application Pending' : 'Become a Vendor')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 relative z-10">
                                                {dbUser?.role === 'VENDOR' && pendingOrderCount > 0 && (
                                                    <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center shadow-lg">
                                                        {pendingOrderCount}
                                                    </span>
                                                )}
                                                <ChevronRightIcon className="w-5 h-5 text-foreground/40" />
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-3 px-2">
                                            Shop & Save
                                        </h3>
                                        <DrawerLink href="/" icon={<StoreIcon className="w-5 h-5" />} label="Marketplace" setIsOpen={setIsDrawerOpen} active={isActive('/')} />
                                        <DrawerLink href="/services" icon={<Tag className="w-5 h-5" />} label="Services" setIsOpen={setIsDrawerOpen} active={isActive('/services')} />
                                        <div
                                            onClick={() => {
                                                setIsDrawerOpen(false);
                                                setCartDrawerOpen(true);
                                            }}
                                            className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-surface/50 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-foreground/60"><ShoppingCartIcon className="w-5 h-5" /></span>
                                                <span className="font-bold text-sm uppercase tracking-tight text-foreground/70">My Cart</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {itemCount > 0 && <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full">{itemCount}</span>}
                                                <ChevronRightIcon className="w-4 h-4 text-foreground/20" />
                                            </div>
                                        </div>
                                        <DrawerLink href="/orders" icon={<PackageIcon className="w-5 h-5" />} label="My Orders" setIsOpen={setIsDrawerOpen} active={isActive('/orders')} badge={dbUser?.role === 'VENDOR' ? pendingOrderCount : 0} />
                                        <DrawerLink href="/dashboard/services" icon={<Tag className="w-5 h-5" />} label="My Services" setIsOpen={setIsDrawerOpen} active={pathname?.startsWith('/dashboard/services')} />
                                        <DrawerLink href="/wishlist" icon={<HeartIcon className="w-5 h-5" />} label="Wishlist" setIsOpen={setIsDrawerOpen} active={isActive('/wishlist')} badge={wishlistCount} />
                                        <DrawerLink href="/security-setup" icon={<Shield className="w-5 h-5 text-blue-500" />} label="OMNI Security" setIsOpen={setIsDrawerOpen} active={isActive('/security-setup')} />
                                        <DrawerLink href="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" setIsOpen={setIsDrawerOpen} active={isActive('/settings')} />
                                    </div>

                                    {/* Specialized Modes */}
                                    {dbUser?.role === 'ADMIN' && (
                                        <div className="mb-6 p-4 bg-surface rounded-2xl border border-surface-border">
                                            <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-3">
                                                Admin Dashboard
                                            </h3>
                                            <DrawerLink href="/dashboard/admin" icon={<ZapIcon className="w-5 h-5 text-red-500" />} label="Admin Command" setIsOpen={setIsDrawerOpen} active={isActive('/dashboard/admin')} className="text-red-500" />
                                        </div>
                                    )}

                                </SignedIn>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Cart Drawer Component */}
            <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
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
            className={`flex items-center justify-between p-3 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${active ? 'bg-surface border border-surface-border shadow-sm' : 'hover:bg-surface/50'} ${className}`}
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
