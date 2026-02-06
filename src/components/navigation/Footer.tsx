// src/components/navigation/Footer.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreIcon, PackageIcon, ZapIcon, HeartIcon } from '@/components/ui/Icons';

export default function Footer() {
    const pathname = usePathname();

    // Pages where footer should be hidden
    const hideFooterPages = [
        '/command-center-z',           // Admin panel
        '/cart',                        // Cart page
        '/checkout',                    // Checkout flow
        '/dashboard/vendor',            // Vendor dashboard
        '/dashboard/admin',             // Admin dashboard
        '/runner',                      // Runner dashboard
        '/onboarding',                  // Onboarding flow
        '/stories/theater',             // Theater mode
        '/sign-in',                     // Sign In
        '/sign-up',                     // Sign Up
        '/security-setup',              // Security Setup
        '/verify',                      // Identity Verification
    ];

    // Check if current page should hide footer
    const shouldHideFooter = hideFooterPages.some(page => pathname?.startsWith(page));

    // Don't render footer on specified pages
    if (shouldHideFooter) return null;

    return (
        <footer className="bg-surface border-t border-surface-border pt-16 pb-8 px-4 mt-24">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="/OMNI-LOGO.ico" alt="OMNI" className="h-12 w-auto invert-on-light" />
                            <span className="text-xl font-black tracking-tighter uppercase italic">OMNI</span>
                        </div>
                        <p className="text-foreground/40 text-xs font-bold leading-relaxed mb-6 uppercase tracking-widest">
                            The ultimate student ecosystem. Trade, earn, and connect within your campus sector.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            <SocialPlaceholder icon="🐦" />
                            <SocialPlaceholder icon="📸" />
                            <SocialPlaceholder icon="🎥" />
                        </div>
                    </div>

                    {/* Marketplace Column */}
                    <div>
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Marketplace</h3>
                        <div className="space-y-4">
                            <FooterLink href="/" label="All Drops" />
                            <FooterLink href="/category/food" label="Food & Logistics" />
                            <FooterLink href="/category/tech" label="Tech Hub" />
                            <FooterLink href="/category/fashion" label="Fashion Gallery" />
                        </div>
                    </div>

                    {/* Ecosystem Column */}
                    <div>
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Ecosystem</h3>
                        <div className="space-y-4">
                            <FooterLink href="/stories" label="Campus Pulse" />
                            <FooterLink href="/runner" label="Runner Dashboard" />
                            <FooterLink href="/become-vendor" label="Become a Vendor" />
                            <FooterLink href="/about" label="About OMNI" />
                        </div>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Terminal</h3>
                        <div className="space-y-4">
                            <FooterLink href="/orders" label="Mission Status" />
                            <FooterLink href="/wishlist" label="Aquisition List" />
                            <FooterLink href="/cart" label="Vault Entry" />
                            <FooterLink href="/help" label="Support Link" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-surface-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">
                        © 2025 OMNI ECOSYSTEM • ALPHA SECTOR 01
                    </div>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-[10px] font-black text-foreground/20 uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">Privacy Protocol</Link>
                        <Link href="/terms" className="text-[10px] font-black text-foreground/20 uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="block text-sm font-bold text-foreground/60 hover:text-primary transition-all hover:translate-x-1"
        >
            {label}
        </Link>
    );
}

function SocialPlaceholder({ icon }: { icon: string }) {
    return (
        <div className="w-10 h-10 rounded-xl bg-background border border-surface-border flex items-center justify-center text-lg hover:border-primary/50 transition-colors cursor-pointer">
            {icon}
        </div>
    );
}
