'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Realistic USTED Student Market Demo Items ────────────────────────────────
const GHOST_PRODUCTS = [
    {
        id: 'g1',
        title: "Adam's Kitchen Jollof Rice",
        vendor: 'Adams Kitchen',
        category: '🍔 Cravings',
        price: 35,
        emoji: '🍛',
        badge: 'POPULAR',
        badgeColor: 'bg-orange-500',
        description: 'The legendary campus jollof with fried chicken + coleslaw. Hits different at midnight.',
    },
    {
        id: 'g2',
        title: 'Used iPhone 13 Pro — 256GB',
        vendor: 'TechHub USTED',
        category: '🔋 Gear',
        price: 2800,
        emoji: '📱',
        badge: 'HOT',
        badgeColor: 'bg-red-500',
        description: 'Fully functional, minor scratches. Comes with original charger. Cash or MoMo.',
    },
    {
        id: 'g3',
        title: 'Engineering Maths Past Questions (2019–2024)',
        vendor: 'AcadPapers',
        category: '🧠 Grind',
        price: 15,
        emoji: '📚',
        badge: 'NEW DROP',
        badgeColor: 'bg-blue-500',
        description: 'Compiled past questions with worked solutions for ENG 201. The ultimate cheat sheet.',
    },
    {
        id: 'g4',
        title: "Chickenman Combo — 2 Pcs + Fries",
        vendor: 'Chickenman Gh',
        category: '🍔 Cravings',
        price: 55,
        emoji: '🍗',
        badge: 'TRENDING',
        badgeColor: 'bg-yellow-600',
        description: 'Everyone talks about Chickenman. Now he talks to you. Delivery to your hostel available.',
    },
    {
        id: 'g5',
        title: 'Hostel Room Essentials Pack',
        vendor: 'DormDeals',
        category: '🌊 Vibe',
        price: 120,
        emoji: '🛋️',
        badge: 'BUNDLE',
        badgeColor: 'bg-purple-500',
        description: 'Fan, mosquito net, extension cord, reading lamp — everything for your first week.',
    },
    {
        id: 'g6',
        title: 'Custom USTED Varsity Hoodie',
        vendor: 'CampusThreads',
        category: '💎 Drip',
        price: 180,
        emoji: '👕',
        badge: 'LIMITED',
        badgeColor: 'bg-emerald-600',
        description: 'Premium cotton. Custom names on request. Represent the campus in style.',
    },
    {
        id: 'g7',
        title: 'HP Laptop (Core i5, 8GB RAM)',
        vendor: 'TechHub USTED',
        category: '🔋 Gear',
        price: 3200,
        emoji: '💻',
        badge: 'POPULAR',
        badgeColor: 'bg-orange-500',
        description: 'Perfectly functional for coursework & coding. Battery holds 4hrs. Keyboard 100%.',
    },
    {
        id: 'g8',
        title: 'Professional CV Writing Service',
        vendor: 'CareerEdge Pro',
        category: '🛠️ Deeds',
        price: 50,
        emoji: '📄',
        badge: '⭐ 4.9',
        badgeColor: 'bg-primary',
        description: 'ATS-optimized CV by a certified HR professional. Delivered in 24hrs via WhatsApp.',
    },
];

interface GhostFeedProps {
    /** Whether user is signed in — if so, show a different CTA */
    isSignedIn?: boolean;
    isOffline?: boolean;
}

export default function GhostFeed({ isSignedIn = false, isOffline = false }: GhostFeedProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<typeof GHOST_PRODUCTS[0] | null>(null);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleCardClick = (product: typeof GHOST_PRODUCTS[0]) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real system: save to a waitlist table / email service
        setSubmitted(true);
        setTimeout(() => {
            setShowModal(false);
            setSubmitted(false);
            setEmail('');
        }, 2500);
    };

    return (
        <>
            {/* ─── Ghost Section Header ──────────────────────────────────── */}
            <div className="space-y-12">
                {isOffline && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-3xl bg-amber-500/10 border border-amber-500/20 px-6 py-4 flex items-center gap-4"
                    >
                        <div className="text-2xl">📶</div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-amber-500 mb-0.5">You're Offline</p>
                            <p className="text-sm text-foreground/70 font-medium">
                                Showing some popular upcoming items until your connection is restored.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Coming Soon Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent border border-primary/20 px-6 py-5 flex items-center gap-4"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(5,150,105,0.12),transparent_60%)] pointer-events-none" />
                    <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl">
                        🚀
                    </div>
                    <div className="relative">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-0.5">Alpha Launch Mode</p>
                        <p className="text-sm text-foreground/70 font-medium leading-snug">
                            LaHustle goes live at USTED <span className="text-foreground font-black">very soon</span>. Sign up now to be the first to shop these drops. ⚡
                        </p>
                    </div>
                </motion.div>

                {/* ─── Ghost Product Grid ──────────────────────────────────── */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                            Dropping Soon
                        </h2>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">🔒 Preview</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {GHOST_PRODUCTS.map((product, i) => (
                            <motion.button
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06, type: 'spring', damping: 18 }}
                                onClick={() => handleCardClick(product)}
                                className="text-left w-full group relative focus:outline-none"
                                aria-label={`Preview ${product.title} — sign up to unlock`}
                            >
                                {/* Actual Card */}
                                <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-primary/5 h-full flex flex-col">
                                    {/* Image Area */}
                                    <div className="h-40 md:h-52 bg-gradient-to-br from-foreground/5 to-foreground/10 relative flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {/* Emoji placeholder — blurred */}
                                        <span className="text-6xl filter blur-sm select-none group-hover:blur-[3px] transition-all duration-300">
                                            {product.emoji}
                                        </span>

                                        {/* Lock Overlay */}
                                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                </svg>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/80">Tap to unlock</span>
                                        </div>

                                        {/* Price Tag */}
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-md rounded-lg text-xs font-black text-foreground z-10 filter blur-[2px]">
                                            ₵{product.price.toFixed(2)}
                                        </div>

                                        {/* Badge */}
                                        <div className={`absolute top-2 left-2 px-2 py-0.5 ${product.badgeColor} text-white text-[8px] font-black uppercase tracking-widest rounded-lg z-10`}>
                                            {product.badge}
                                        </div>

                                        {/* Lock Icon (always visible) */}
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center z-10">
                                            <svg className="w-3 h-3 text-foreground/60" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 flex flex-col flex-1">
                                        <h3 className="text-xs font-black uppercase truncate text-foreground mb-0.5">
                                            {product.title}
                                        </h3>
                                        <p className="text-[10px] text-foreground/50 font-bold uppercase truncate mb-2">
                                            {product.vendor} · {product.category}
                                        </p>
                                        <div className="mt-auto pt-2 border-t border-surface-border">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                                🔔 Notify me →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center py-8"
                >
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.4em] mb-4">
                        {GHOST_PRODUCTS.length}+ items dropping at launch
                    </p>
                    {!isSignedIn ? (
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25"
                        >
                            <span>🔓</span> Create Account to Shop
                        </Link>
                    ) : (
                        <p className="text-sm font-bold text-foreground/40">
                            🎯 You're on the list! We'll notify you when products drop.
                        </p>
                    )}
                </motion.div>
            </div>

            {/* ─── Sign Up Modal ─────────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ y: 60, scale: 0.95, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 60, scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="w-full max-w-md bg-background border border-surface-border rounded-3xl overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-br from-primary/15 to-emerald-500/5 px-6 pt-6 pb-4 border-b border-surface-border">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl">
                                        {selectedProduct.emoji}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">LaHustle Alpha Drop</p>
                                        <h3 className="text-base font-black uppercase tracking-tight text-foreground leading-tight">
                                            {selectedProduct.title}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                                    {selectedProduct.description}
                                </p>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-5">
                                {!submitted ? (
                                    <>
                                        <p className="text-sm font-black uppercase tracking-tight text-foreground mb-1">
                                            🚀 LaHustle goes live at USTED soon!
                                        </p>
                                        <p className="text-xs text-foreground/50 font-medium mb-4 leading-relaxed">
                                            Create your account now — get instant notifications the moment <span className="text-foreground font-bold">this item drops</span> and earn the exclusive <span className="text-primary font-bold">Early Bird</span> badge.
                                        </p>

                                        {isSignedIn ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                                    <span className="text-2xl">🎯</span>
                                                    <p className="text-sm font-bold text-foreground/80">
                                                        You're already on the list! We'll notify you when vendors start listing.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setShowModal(false)}
                                                    className="w-full py-3 bg-surface border border-surface-border rounded-xl text-xs font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
                                                >
                                                    Got it
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Link
                                                    href="/sign-up"
                                                    className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/30"
                                                >
                                                    <span>🔓</span> Create Free Account
                                                </Link>
                                                <p className="text-center text-[10px] text-foreground/40 font-medium">
                                                    Already have one?{' '}
                                                    <Link href="/sign-in" className="text-primary font-bold hover:underline">
                                                        Sign in
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center py-6"
                                    >
                                        <div className="text-5xl mb-3">🎉</div>
                                        <p className="text-lg font-black uppercase text-foreground">You're on the list!</p>
                                        <p className="text-xs text-foreground/50 font-medium mt-1">
                                            We'll ping you the moment LaHustle launches.
                                        </p>
                                    </motion.div>
                                )}

                                {/* Close Button */}
                                {!submitted && (
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface border border-surface-border flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors text-xs"
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
