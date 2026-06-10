'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import GhostFeed from './GhostFeed';

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
    };
    // New Fields for Enhanced UI
    averageRating?: number;
    totalReviews?: number;
    isInStock?: boolean;
    flashSale?: {
        salePrice: number;
        originalPrice: number;
        discountPercent: number;
        isActive: boolean;
    } | null;
}

interface DiscoveryFeedData {
    newArrivals: FeedProduct[];
    trending: FeedProduct[];
    recommended: FeedProduct[];
}

export default function SmartFeed() {
    const { user } = useUser();
    const [feed, setFeed] = useState<DiscoveryFeedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    // Fetch Feed Data — gracefully degrades to GhostFeed on any error/offline state
    useEffect(() => {
        // Detect initial offline state
        if (typeof window !== 'undefined' && !navigator.onLine) {
            setIsOffline(true);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        fetch('/api/marketplace/discovery', { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFeed(data.feed);
                }
                // If not success, feed stays null → GhostFeed renders
            })
            .catch(() => {
                // Network error or offline → show GhostFeed
                setIsOffline(!navigator.onLine);
            })
            .finally(() => {
                clearTimeout(timeout);
                setLoading(false);
            });

        // Listen for online/offline events
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => {
            setIsOffline(false);
            // Re-fetch when connection restored
            setLoading(true);
            fetch('/api/marketplace/discovery')
                .then(res => res.json())
                .then(data => { if (data.success) setFeed(data.feed); })
                .catch(() => {})
                .finally(() => setLoading(false));
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    // Skeleton loader while fetching
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
                        <div className="h-40 md:h-52 bg-foreground/5 animate-pulse" />
                        <div className="p-3 space-y-2">
                            <div className="h-3 bg-foreground/5 rounded animate-pulse w-3/4" />
                            <div className="h-2 bg-foreground/5 rounded animate-pulse w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty DB → show the Coming Soon illusion feed
    const isEmpty = !feed || (feed.newArrivals.length === 0 && feed.trending.length === 0 && feed.recommended.length === 0);

    if (isEmpty || isOffline) {
        const isSignedIn = !!user;
        return <GhostFeed isSignedIn={isSignedIn} isOffline={isOffline} />;
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
                        <Image 
                            src={product.imageUrl} 
                            alt={product.title} 
                            fill 
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw" 
                            className="object-cover transition-transform duration-500 group-hover:scale-110" 
                            loading="lazy" 
                        />
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
