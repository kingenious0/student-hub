// src/components/navigation/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

export default function Navbar() {
    const pathname = usePathname();
    const { user } = useUser();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl">🎓</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            Student Hub
                        </span>
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
                            <NavLink href="/runner" isActive={isActive('/runner')}>
                                🏃 Runner Mode
                            </NavLink>
                            <NavLink href="/dashboard/vendor" isActive={isActive('/dashboard/vendor')}>
                                📊 Vendor
                            </NavLink>
                        </SignedIn>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex items-center gap-3">
                                <span className="hidden md:block text-sm text-purple-200">
                                    {user?.firstName || 'User'}
                                </span>
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-10 h-10"
                                        }
                                    }}
                                />
                            </div>
                        </SignedIn>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <SignedIn>
                    <div className="md:hidden flex gap-2 pb-3 overflow-x-auto">
                        <MobileNavLink href="/marketplace" isActive={isActive('/marketplace')}>
                            🛍️ Shop
                        </MobileNavLink>
                        <MobileNavLink href="/orders" isActive={isActive('/orders')}>
                            📦 Orders
                        </MobileNavLink>
                        <MobileNavLink href="/runner" isActive={isActive('/runner')}>
                            🏃 Runner
                        </MobileNavLink>
                        <MobileNavLink href="/dashboard/vendor" isActive={isActive('/dashboard/vendor')}>
                            📊 Vendor
                        </MobileNavLink>
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
            className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
        >
            {children}
        </Link>
    );
}
