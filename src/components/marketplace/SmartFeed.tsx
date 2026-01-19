'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FeedProduct {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    vendor: {
        id: string;
        name: string | null;
        shopName: string | null;
    };
    category: {
        name: string;
    }
}

interface DiscoveryFeedData {
    newArrivals: FeedProduct[];
    trending: FeedProduct[];
    recommended: FeedProduct[];
}

export default function SmartFeed() {
    const [feed, setFeed] = useState<DiscoveryFeedData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await fetch('/api/marketplace/discovery');
                const data = await res.json();
                if (data.success) {
                    setFeed(data.feed);
                }
            } catch (e) {
                console.error("Feed Error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-64 bg-surface/50 rounded-3xl"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-48 bg-surface/50 rounded-2xl"></div>
                <div className="h-48 bg-surface/50 rounded-2xl"></div>
            </div>
        </div>
    );


    // NEW: Premium Empty State
    const isEmpty = !feed || (feed.newArrivals.length === 0 && feed.trending.length === 0 && feed.recommended.length === 0);

    if (isEmpty) {
        return (

            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-surface border border-surface-border p-8 rounded-full shadow-2xl">
                        <span className="text-4xl">🔥</span>
                    </div>
                </div>
                <div className="space-y-4 max-w-md px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                        AAMUSTED’s Biggest Hustle is About to Begin
                    </h2>
                    <p className="text-sm text-foreground/60 font-medium leading-relaxed">
                        The marketplace is fresh, and the opportunity is huge. <br />
                        Be the first to list your products and earn the exclusive <span className="text-primary font-bold">"Founding Vendor"</span> badge!
                    </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Link
                        href="/become-vendor"
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                        <span>🚀</span> Register as a Seller
                    </Link>
                    <p className="text-[10px] uppercase font-bold text-foreground/30">
                        Limited Spots for Alpha Launch
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24">

            {/* Section 1: Recommended For You (Horizontal) */}
            {feed.recommended.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Just For You</h2>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Personalized</span>
                    </div>
                    <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        <div className="flex gap-4">
                            {feed.recommended.map((item, i) => (
                                <ProductCard key={item.id} product={item} index={i} compact />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Section 2: Trending Now (Horizontal) */}
            {feed.trending.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Trending @ Campus</h2>
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">🔥 Live</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {feed.trending.map((item, i) => (
                            <div key={item.id} className="snap-center">
                                <ProductCard product={item} index={i} compact badge="POPULAR" badgeColor="bg-orange-500" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Section 3: New Arrivals (Vertical Infinite Feed) */}
            {feed.newArrivals.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Fresh Drops</h2>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Realtime</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {feed.newArrivals.map((item, i) => (
                            <ProductCard key={item.id} product={item} index={i} badge="NEW DROP" badgeColor="bg-blue-500" />
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">End of Feed</p>
                    </div>
                </section>
            )}
        </div>
    );
}

function ProductCard({ product, index, compact = false, badge, badgeColor = 'bg-primary' }: { product: FeedProduct, index: number, compact?: boolean, badge?: string, badgeColor?: string }) {
    return (
        <Link href={`/products/${product.id}`} className={`block group ${compact ? 'min-w-[160px] w-[160px]' : 'w-full'}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface border border-surface-border rounded-2xl overflow-hidden group-hover:border-primary/50 transition-all shadow-sm h-full flex flex-col"
            >
                <div className={`${compact ? 'h-32' : 'h-40 md:h-56'} bg-background relative overflow-hidden flex-shrink-0`}>
                    {product.imageUrl ? (
                        <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                    {/* Price Tag */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-md rounded-lg text-xs font-black text-foreground z-10">
                        ₵{product.price.toFixed(2)}
                    </div>
                    {/* Badge */}
                    {badge && (
                        <div className={`absolute top-2 right-2 px-2 py-1 ${badgeColor} text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg z-10`}>
                            {badge}
                        </div>
                    )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-xs font-black uppercase truncate text-foreground mb-1">{product.title}</h3>
                    <p className="text-[10px] text-foreground/50 font-bold uppercase truncate">{product.vendor.shopName || product.vendor.name}</p>
                </div>
            </motion.div>
        </Link>
    );
}
