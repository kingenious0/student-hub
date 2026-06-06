'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const ref = searchParams.get('ref');
    const phone = searchParams.get('phone');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="max-w-lg mx-auto px-4 relative z-10 w-full">
                <div className="bg-surface border border-surface-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center space-y-8">
                    {/* Success Icon */}
                    <div className="relative">
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-5xl">✅</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/30">
                            <span className="text-white text-xs font-black">✓</span>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter">
                            Order Placed!
                        </h1>
                        <p className="text-foreground/40 font-medium text-sm">
                            Your payment has been received successfully.
                        </p>
                    </div>

                    {/* Order Reference */}
                    {ref && (
                        <div className="bg-foreground/5 rounded-2xl p-5 border border-surface-border">
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">
                                Order Reference
                            </p>
                            <p className="text-lg font-black text-foreground tracking-tight font-mono">
                                {ref}
                            </p>
                        </div>
                    )}

                    {/* Contact Info */}
                    {phone && (
                        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                                📞 We'll contact you at
                            </p>
                            <p className="text-lg font-black text-foreground">
                                {phone}
                            </p>
                            <p className="text-xs text-foreground/40 mt-2">
                                The vendor will reach out for delivery coordination. Keep your phone handy!
                            </p>
                        </div>
                    )}

                    {/* Account Creation Prompt */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 space-y-3">
                        <div className="flex items-center gap-3 justify-center">
                            <span className="text-2xl">🔑</span>
                            <p className="text-sm font-black uppercase tracking-tight text-foreground">
                                Save Your Order & Track It
                            </p>
                        </div>
                        <p className="text-xs text-foreground/60">
                            Create a free account to view your order history, track delivery status, and check out faster next time.
                        </p>

                        {/* CRITICAL: Phone matching instruction */}
                        {phone && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                                    ⚠️ Important
                                </p>
                                <p className="text-xs text-foreground/70 mt-1">
                                    Use <strong className="text-foreground">{phone}</strong> when creating your account so your order is automatically linked to your profile. If you use a different number, your order won't appear in your history.
                                </p>
                            </div>
                        )}

                        <Link
                            href="/sign-up"
                            className="inline-block w-full py-4 bg-primary hover:brightness-110 text-primary-foreground rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Create Free Account →
                        </Link>
                        <Link
                            href="/"
                            className="inline-block w-full py-3 text-foreground/40 hover:text-foreground font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                            Continue Browsing
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
