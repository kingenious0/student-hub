// src/components/navigation/Footer.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LaHustleLogo } from '@/components/ui/LaHustleLogo'

export default function Footer() {
    const pathname = usePathname()

    // Pages where footer should be hidden
    const hideFooterPages = [
        '/command-center-z',           // Admin panel
        '/cart',                        // Cart page
        '/checkout',                    // Checkout flow
        '/dashboard/vendor',            // Vendor dashboard
        '/dashboard/admin',             // Admin dashboard
        '/onboarding',                  // Onboarding flow
        '/sign-in',                     // Sign In
        '/sign-up',                     // Sign Up
        '/security-setup',              // Security Setup
        '/verify',                      // Identity Verification
    ]

    // Check if current page should hide footer
    const shouldHideFooter = hideFooterPages.some(page => pathname?.startsWith(page))

    // Don't render footer on specified pages
    if (shouldHideFooter) return null

    return (
        <footer className="bg-background/80 backdrop-blur-md border-t border-surface-border py-8 px-6 mt-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Brand & Copyright */}
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <LaHustleLogo size="sm" showTagline={false} />
                    <span className="hidden sm:inline text-foreground/20">•</span>
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} LaHustle
                    </span>
                </div>

                {/* Minimal Links */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
                    <FooterLink href="/marketplace" label="Market" />
                    <FooterLink href="/become-vendor" label="Vendor" />
                    <FooterLink href="/orders" label="Missions" />
                    <FooterLink href="/help" label="Support" />
                </div>

                {/* Policies */}
                <div className="flex items-center gap-6">
                    <Link href="/privacy" className="text-[10px] font-black text-foreground/30 uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">
                        Privacy
                    </Link>
                    <Link href="/terms" className="text-[10px] font-black text-foreground/30 uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">
                        Terms
                    </Link>
                </div>

            </div>
        </footer>
    )
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="text-xs font-bold text-foreground/60 hover:text-primary transition-colors cursor-pointer"
        >
            {label}
        </Link>
    )
}
