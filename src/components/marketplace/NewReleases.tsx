'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface NewRelease {
    id: string;
    title: string;
    description: string;
    price: number;
    category: {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
    };
    imageUrl: string | null;
    hotspot: string | null;
    vendor: {
        id: string;
        name: string | null;
        shopName: string | null;
        currentHotspot: string | null;
        isAcceptingOrders: boolean;
    };
    timeAgo: string;
    isVendorActive: boolean;
    createdAt: string;
}

export default function NewReleases() {
    const [releases, setReleases] = useState<NewRelease[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNewReleases();
    }, []);

    const fetchNewReleases = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/products/new-releases');
            const data = await response.json();

            if (data.success) {
                setReleases(data.products);
            }
        } catch (error) {
            console.error('Failed to fetch new releases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (productId: string) => {
        router.push(`/products/${productId}`);
    };

    // Don't render if no new releases
    if (!loading && releases.length === 0) {
        return null;
    }

    return (
        <div className="mb-16">
            {/* Section Header */}
            <div className="mb-8 relative">
                <div className="flex items-center gap-4 mb-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                        <span className="relative text-4xl">⚡</span>
                    </div>
                    <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                        NEW RELEASES
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-[2px] w-8 bg-primary"></div>
                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                        Dropped in the last 72 hours
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent omni-glow"></div>
                    <p className="mt-4 text-primary font-black uppercase tracking-[0.4em] text-[10px]">Loading Fresh Drops...</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Horizontal Scroll Container */}
                    <div className="overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex gap-6 min-w-max">
                            {releases.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleProductClick(product.id)}
                                    className="w-80 bg-surface border-2 border-primary/30 rounded-[2rem] overflow-hidden hover:border-primary transition-all group relative cursor-pointer new-release-glow"
                                >
                                    {/* Electric Green Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                    {/* Animated Border Pulse */}
                                    <div className="absolute inset-0 rounded-[2rem] border-2 border-primary/50 animate-pulse pointer-events-none"></div>

                                    {/* Product Image */}
                                    <div className="h-56 bg-background/50 relative overflow-hidden">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-surface to-background flex items-center justify-center text-6xl">
                                                📦
                                            </div>
                                        )}

                                        {/* Time Badge - Top Left */}
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary/90 backdrop-blur-md rounded-full border border-primary/20 flex items-center gap-2">
                                            <span className="text-xs font-black text-primary-foreground uppercase tracking-wider">
                                                {product.timeAgo}
                                            </span>
                                        </div>

                                        {/* Hot Indicator for Food Category */}
                                        {product.category.name.toLowerCase().includes('food') && (
                                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-500/90 backdrop-blur-md rounded-full border border-red-400/20 flex items-center gap-1">
                                                <span className="text-base">🔥</span>
                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">HOT</span>
                                            </div>
                                        )}

                                        {/* Vendor Status - Bottom Right */}
                                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full border border-primary/20 flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${product.isVendorActive ? 'bg-primary animate-pulse' : 'bg-foreground/20'}`}></div>
                                            <span className="text-[8px] font-black text-foreground uppercase tracking-widest">
                                                {product.isVendorActive ? 'Live' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6 relative">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter leading-none line-clamp-1">
                                                {product.title}
                                            </h3>
                                        </div>

                                        <p className="text-foreground/40 text-xs font-bold mb-4 line-clamp-2 uppercase tracking-wide">
                                            {product.description}
                                        </p>

                                        <div className="flex items-center gap-2 mb-6 flex-wrap">
                                            <div className="px-2.5 py-1 bg-foreground/5 rounded-full text-[8px] font-black text-primary uppercase tracking-widest border border-primary/10">
                                                📍 {product.hotspot || 'HQ'}
                                            </div>
                                            <div className="px-2.5 py-1 bg-foreground/5 rounded-full text-[8px] font-black text-foreground/40 uppercase tracking-widest border border-foreground/10">
                                                {product.category.name}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Price</span>
                                                <span className="text-2xl font-black text-foreground tracking-tighter leading-none">
                                                    ₵{product.price.toFixed(2)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProductClick(product.id);
                                                }}
                                                className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg hover:shadow-primary/30"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    {releases.length > 3 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background via-background to-transparent w-24 h-full pointer-events-none flex items-center justify-end pr-4">
                            <div className="text-primary/40 text-2xl animate-pulse">→</div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                @keyframes glow-pulse {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.3);
                    }
                    50% {
                        box-shadow: 0 0 40px rgba(var(--primary-rgb), 0.5);
                    }
                }
                
                .new-release-glow {
                    animation: glow-pulse 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
