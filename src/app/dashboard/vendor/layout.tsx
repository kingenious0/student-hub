// src/app/dashboard/vendor/layout.tsx
'use client';

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import ThemeToggle from '@/components/navigation/ThemeToggle';
import { StoreIcon, PackageIcon, ShoppingCartIcon, ZapIcon, HomeIcon } from "@/components/ui/Icons";
import MaintenanceGuard from '@/components/admin/MaintenanceGuard';

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const omniToken = searchParams?.get('__omni_token');

    // Helper to preserve auth token in navigation
    const getHref = (path: string) => omniToken ? `${path}?__omni_token=${omniToken}` : path;
    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-[#39FF14] selection:text-black font-sans transition-colors duration-300">
            {/* PROFESSIONAL VENDOR NAVIGATION (Side/Top Hybrid) */}
            <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-surface-border h-16 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#39FF14] flex items-center justify-center">
                            <StoreIcon className="w-5 h-5 text-black" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tight leading-none text-foreground">OMNI</span>
                            <span className="text-[10px] font-bold text-primary dark:text-[#39FF14] tracking-widest uppercase leading-none">Vendor Terminal</span>
                        </div>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1 bg-surface p-1 rounded-full border border-surface-border transition-colors duration-300">
                        <VendorLink href={getHref("/dashboard/vendor")} icon={<HomeIcon className="w-4 h-4" />} label="Overview" active={isActive('/dashboard/vendor')} />
                        <VendorLink href={getHref("/dashboard/vendor/products")} icon={<PackageIcon className="w-4 h-4" />} label="Inventory" active={isActive('/dashboard/vendor/products')} />
                        <VendorLink href={getHref("/dashboard/vendor/orders")} icon={<ZapIcon className="w-4 h-4" />} label="Orders" active={isActive('/dashboard/vendor/orders')} />
                        <VendorLink href={getHref("/dashboard/vendor/scan")} icon={<div className="w-4 h-4 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">QR</div>} label="Scan" active={isActive('/dashboard/vendor/scan')} />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {/* Switch Back / Exit Terminal */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-xs font-bold text-green-500 transition-colors"
                            title="Exit Terminal"
                        >
                            <span className="md:hidden text-[10px] uppercase font-black tracking-widest border-2 border-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg shadow-sm">Exit</span>
                            <span className="hidden md:inline hover:underline">Exit Mode</span>
                        </Link>

                        <div className="h-8 w-[1px] bg-foreground/10 hidden md:block"></div>

                        <SignedIn>
                            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-2 ring-foreground/20" } }} />
                        </SignedIn>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-20 pb-24 px-4 max-w-7xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <MaintenanceGuard protocol="VENDOR">
                        {children}
                    </MaintenanceGuard>
                </div>
            </main>

            {/* Mobile Bottom Bar for Vendors */}
            <div className="md:hidden fixed bottom-0 w-full bg-background/90 backdrop-blur-xl border-t border-surface-border pb-safe z-50 transition-colors duration-300">
                <div className="flex justify-around items-center h-16">
                    <MobileVendorLink href={getHref("/dashboard/vendor")} icon={<HomeIcon className="w-5 h-5" />} label="Home" active={isActive('/dashboard/vendor')} />
                    <MobileVendorLink href={getHref("/dashboard/vendor/products")} icon={<PackageIcon className="w-5 h-5" />} label="Items" active={isActive('/dashboard/vendor/products')} />
                    <MobileVendorLink href={getHref("/dashboard/vendor/orders")} icon={<ZapIcon className="w-5 h-5" />} label="Orders" active={isActive('/dashboard/vendor/orders')} />
                    <MobileVendorLink href={getHref("/dashboard/vendor/scan")} icon={<div className="font-bold text-[10px] border-2 border-current rounded w-5 h-5 flex items-center justify-center">QR</div>} label="Verify" active={isActive('/dashboard/vendor/scan')} />
                    <MobileVendorLink href="/marketplace" icon={<ShoppingCartIcon className="w-5 h-5" />} label="Shop" active={false} />
                </div>
            </div>
        </div>
    );
}

function VendorLink({ href, icon, label, active }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'}`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

function MobileVendorLink({ href, icon, label, active }: any) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${active ? 'text-primary dark:text-[#39FF14]' : 'text-foreground/40'}`}
        >
            {icon}
            <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
        </Link>
    );
}
