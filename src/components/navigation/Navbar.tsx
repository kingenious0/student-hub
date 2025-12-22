// src/components/navigation/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const pathname = usePathname();
    const { user, isLoaded: clerkLoaded } = useUser();
    const [dbUser, setDbUser] = useState<{ role: string; vendorStatus: string; isRunner: boolean; onboarded: boolean } | null>(null);

    useEffect(() => {
        if (clerkLoaded && user) {
            fetch('/api/users/me')
                .then(res => res.json())
                .then(data => setDbUser(data))
                .catch(() => setDbUser(null));
        } else if (clerkLoaded && !user) {
            setTimeout(() => setDbUser(null), 0);
        }
    }, [clerkLoaded, user, pathname]);

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-surface-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <img
                            src="/OMNI-LOGO.ico"
                            alt="OMNI"
                            className="h-16 w-auto transition-transform group-hover:scale-110 invert-on-light"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        <SignedIn>
                            <NavLink href="/marketplace" isActive={isActive('/marketplace')}>
                                🛍️ Marketplace
                            </NavLink>
                            <NavLink href="/orders" isActive={isActive('/orders')}>
                                📦 My Orders
                            </NavLink>
                            <NavLink href="/stories" isActive={isActive('/stories')}>
                                📱 Campus Pulse
                            </NavLink>

                            {dbUser?.isRunner && (
                                <NavLink href="/runner" isActive={isActive('/runner')}>
                                    🏃 Runner Mode
                                </NavLink>
                            )}

                            {dbUser?.role === 'VENDOR' && (
                                <NavLink href="/dashboard/vendor" isActive={isActive('/dashboard/vendor')}>
                                    📊 Vendor Terminal
                                </NavLink>
                            )}

                            {dbUser?.role === 'ADMIN' && (
                                <NavLink href="/dashboard/admin" isActive={isActive('/dashboard/admin')}>
                                    ⚡ OMNI Command
                                </NavLink>
                            )}
                        </SignedIn>
                    </div>

                    {/* Auth & Theme Section */}
                    <div className="flex items-center gap-6">
                        <ThemeToggle />

                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest transition-all omni-glow active:scale-95">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex items-center gap-3">
                                <span className="hidden md:block text-xs font-black text-foreground/40 uppercase tracking-widest">
                                    {dbUser?.role || 'STUDENT'}
                                </span>
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-9 h-9 border-2 border-primary/20"
                                        }
                                    }}
                                />
                            </div>
                        </SignedIn>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <SignedIn>
                    <div className="md:hidden flex gap-2 pb-3 overflow-x-auto no-scrollbar">
                        <MobileNavLink href="/marketplace" isActive={isActive('/marketplace')}>
                            🛍️ Marketplace
                        </MobileNavLink>
                        <MobileNavLink href="/orders" isActive={isActive('/orders')}>
                            📦 Orders
                        </MobileNavLink>
                        <MobileNavLink href="/stories" isActive={isActive('/stories')}>
                            📱 Pulse
                        </MobileNavLink>
                        {dbUser?.isRunner && (
                            <MobileNavLink href="/runner" isActive={isActive('/runner')}>
                                🏃 Runner
                            </MobileNavLink>
                        )}
                        {dbUser?.role === 'VENDOR' && (
                            <MobileNavLink href="/dashboard/vendor" isActive={isActive('/dashboard/vendor')}>
                                📊 Vendor
                            </MobileNavLink>
                        )}
                        {dbUser?.role === 'ADMIN' && (
                            <MobileNavLink href="/dashboard/admin" isActive={isActive('/dashboard/admin')}>
                                ⚡ Admin
                            </MobileNavLink>
                        )}
                    </div>
                </SignedIn>
            </div>
        </nav>
    );
}

function NavLink({
    href,
    isActive,
    children
}: {
    href: string;
    isActive: boolean;
    children: React.ReactNode;
}) {
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

function MobileNavLink({
    href,
    isActive,
    children
}: {
    href: string;
    isActive: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface/50 text-foreground/40 hover:bg-surface border border-surface-border'
                }`}
        >
            {children}
        </Link>
    );
}
