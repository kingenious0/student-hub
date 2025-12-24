'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string | null;
    hotspot: string | null;
    details: any;
    createdAt: string;
    vendor: {
        id: string;
        name: string | null;
        isAcceptingOrders: boolean;
        currentHotspot: string | null;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    products: Product[];
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

export default function CategoryHubPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // Filter states
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [selectedHotspot, setSelectedHotspot] = useState<string>('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [showActiveOnly, setShowActiveOnly] = useState(false);

    // Category-specific filters
    const [spicyLevel, setSpicyLevel] = useState<string>('');
    const [condition, setCondition] = useState<string>('');

    useEffect(() => {
        fetchCategory();
    }, [slug]);

    useEffect(() => {
        if (category) {
            applyFilters();
        }
    }, [category, sortBy, selectedHotspot, priceRange, showActiveOnly, spicyLevel, condition]);

    const fetchCategory = async () => {
        try {
            const res = await fetch(`/api/categories/${slug}`);
            const data = await res.json();
            if (data.success) {
                setCategory(data.category);
                // Set initial price range based on products
                if (data.category.products.length > 0) {
                    const prices = data.category.products.map((p: Product) => p.price);
                    setPriceRange([0, Math.max(...prices)]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch category hub:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!category) return;

        let filtered = [...category.products];

        // Hotspot filter
        if (selectedHotspot) {
            filtered = filtered.filter(p => p.hotspot === selectedHotspot);
        }

        // Price range filter
        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Active vendors only
        if (showActiveOnly) {
            filtered = filtered.filter(p => p.vendor.isAcceptingOrders);
        }

        // Category-specific filters
        if (slug === 'food-and-snacks' && spicyLevel) {
            filtered = filtered.filter(p => p.details?.spicyLevel === spicyLevel);
        }

        if (slug === 'tech-and-gadgets' && condition) {
            filtered = filtered.filter(p => p.details?.condition === condition);
        }

        // Sorting
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
        }

        setFilteredProducts(filtered);
    };

    const getHeaderGradient = () => {
        switch (slug) {
            case 'food-and-snacks': return { bg: 'from-orange-500/20 to-red-500/20', text: 'text-orange-500', icon: '🍕' };
            case 'tech-and-gadgets': return { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-cyan-500', icon: '💻' };
            case 'fashion': return { bg: 'from-pink-500/20 to-purple-500/20', text: 'text-pink-500', icon: '👕' };
            case 'books-and-notes': return { bg: 'from-amber-500/20 to-yellow-500/20', text: 'text-amber-500', icon: '📚' };
            case 'services': return { bg: 'from-yellow-500/20 to-orange-500/20', text: 'text-yellow-500', icon: '⚡' };
            default: return { bg: 'from-primary/20 to-primary/5', text: 'text-primary', icon: '🎯' };
        }
    };

    const theme = getHeaderGradient();
    const hotspots = Array.from(new Set(category?.products.map(p => p.hotspot).filter(Boolean) as string[]));

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent omni-glow mb-4"></div>
                    <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Loading Hub...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="text-8xl mb-6 opacity-20">🕸️</div>
                <h1 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">404</h1>
                <p className="text-foreground/40 text-xs font-black uppercase tracking-widest mb-8">Hub Not Found</p>
                <Link href="/marketplace" className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest omni-glow active:scale-95 transition-all">
                    Return to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300 pb-24">
            {/* HERO HEADER */}
            <div className={`relative pt-32 pb-16 px-4 overflow-hidden border-b border-surface-border bg-gradient-to-b ${theme.bg}`}>
                <div className="max-w-7xl mx-auto relative z-10">
                    <Link href="/marketplace" className="inline-flex items-center gap-2 text-foreground/40 hover:text-foreground mb-8 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Marketplace
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-12">
                        {/* Category Icon */}
                        <div className="w-32 h-32 bg-surface backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-6xl shadow-2xl border border-white/10 animate-in zoom-in duration-500 animate-float">
                            {category.icon || theme.icon}
                        </div>

                        {/* Category Info */}
                        <div className="flex-1">
                            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 uppercase tracking-tighter leading-none">
                                {category.name}
                            </h1>
                            <p className="text-lg md:text-xl font-bold opacity-60 max-w-2xl leading-relaxed uppercase tracking-wide">
                                {category.description || `Browse all ${category.name.toLowerCase()} available on campus`}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                            <div className="text-5xl font-black text-foreground leading-none mb-1">{filteredProducts.length}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                {filteredProducts.length === category.products.length ? 'Total Items' : `of ${category.products.length}`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </div>

            {/* FILTERS & SORTING */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-surface border border-surface-border rounded-[2rem] p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Sort By */}
                        <div>
                            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>

                        {/* Hotspot Filter */}
                        {hotspots.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Location</label>
                                <select
                                    value={selectedHotspot}
                                    onChange={(e) => setSelectedHotspot(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                >
                                    <option value="">All Hotspots</option>
                                    {hotspots.map(hotspot => (
                                        <option key={hotspot} value={hotspot}>📍 {hotspot}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Category-Specific Filters */}
                        {slug === 'food-and-snacks' && (
                            <div>
                                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Spicy Level</label>
                                <select
                                    value={spicyLevel}
                                    onChange={(e) => setSpicyLevel(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                >
                                    <option value="">All Levels</option>
                                    <option value="Mild">🌶️ Mild</option>
                                    <option value="Medium">🌶️🌶️ Medium</option>
                                    <option value="Hot">🌶️🌶️🌶️ Hot</option>
                                    <option value="Fire">🔥 Fire</option>
                                </select>
                            </div>
                        )}

                        {slug === 'tech-and-gadgets' && (
                            <div>
                                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Condition</label>
                                <select
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                >
                                    <option value="">All Conditions</option>
                                    <option value="New">✨ New (Sealed)</option>
                                    <option value="Like New">📦 Like New</option>
                                    <option value="Used">🔧 Used (Good)</option>
                                    <option value="Refurbished">♻️ Refurbished</option>
                                </select>
                            </div>
                        )}

                        {/* Active Vendors Toggle */}
                        <div className="flex items-end">
                            <button
                                onClick={() => setShowActiveOnly(!showActiveOnly)}
                                className={`w-full px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${showActiveOnly
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'bg-background border border-surface-border text-foreground hover:border-primary/50'
                                    }`}
                            >
                                {showActiveOnly ? '✓ Active Only' : 'All Vendors'}
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {(selectedHotspot || spicyLevel || condition || showActiveOnly) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {selectedHotspot && (
                                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary">
                                    📍 {selectedHotspot}
                                    <button onClick={() => setSelectedHotspot('')} className="ml-2">×</button>
                                </span>
                            )}
                            {spicyLevel && (
                                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-500">
                                    🌶️ {spicyLevel}
                                    <button onClick={() => setSpicyLevel('')} className="ml-2">×</button>
                                </span>
                            )}
                            {condition && (
                                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-500">
                                    {condition}
                                    <button onClick={() => setCondition('')} className="ml-2">×</button>
                                </span>
                            )}
                            {showActiveOnly && (
                                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-bold text-green-500">
                                    Active Vendors
                                    <button onClick={() => setShowActiveOnly(false)} className="ml-2">×</button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* PRODUCT GRID */}
                <AnimatePresence mode="wait">
                    {filteredProducts.length > 0 ? (
                        <motion.div
                            key="products"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/products/${product.id}`} className="group block h-full">
                                        <div className="bg-surface border border-surface-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all h-full flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1 duration-300">
                                            {/* Image */}
                                            <div className="h-64 relative bg-black/5 overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        alt={product.title}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl">
                                                        {category.icon || theme.icon}
                                                    </div>
                                                )}

                                                {/* Badges */}
                                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                                                    {product.hotspot && (
                                                        <div className="px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
                                                            📍 {product.hotspot}
                                                        </div>
                                                    )}
                                                    {slug === 'food-and-snacks' && product.details?.spicyLevel === 'Fire' && (
                                                        <div className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                                                            🔥 SPICY
                                                        </div>
                                                    )}
                                                    {slug === 'tech-and-gadgets' && (
                                                        <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                                                            🛡️ Escrow
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Vendor Status */}
                                                <div className="absolute bottom-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full border border-primary/20 flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${product.vendor.isAcceptingOrders ? 'bg-primary animate-pulse' : 'bg-foreground/20'}`}></div>
                                                    <span className="text-[8px] font-black text-foreground uppercase tracking-widest">
                                                        {product.vendor.isAcceptingOrders ? 'Active' : 'Offline'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-8 flex-1 flex flex-col">
                                                <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight line-clamp-1">
                                                    {product.title}
                                                </h3>
                                                <p className="text-foreground/40 text-xs font-bold mb-6 line-clamp-2 uppercase tracking-wide">
                                                    {product.description}
                                                </p>

                                                {/* Category-Specific Details */}
                                                <div className="mt-auto space-y-2">
                                                    {slug === 'tech-and-gadgets' && product.details?.condition && (
                                                        <div className="flex justify-between items-center py-2 border-t border-surface-border">
                                                            <span className="text-[10px] uppercase font-bold text-foreground/40">Condition</span>
                                                            <span className="text-xs font-black uppercase">{product.details.condition}</span>
                                                        </div>
                                                    )}

                                                    {slug === 'food-and-snacks' && product.details?.prepTime && (
                                                        <div className="flex justify-between items-center py-2 border-t border-surface-border">
                                                            <span className="text-[10px] uppercase font-bold text-foreground/40">Prep Time</span>
                                                            <span className="text-xs font-black uppercase text-orange-500">{product.details.prepTime}</span>
                                                        </div>
                                                    )}

                                                    {slug === 'books-and-notes' && product.details?.courseCode && (
                                                        <div className="flex justify-between items-center py-2 border-t border-surface-border">
                                                            <span className="text-[10px] uppercase font-bold text-foreground/40">Course</span>
                                                            <span className="text-xs font-black uppercase bg-foreground/5 px-2 py-1 rounded">{product.details.courseCode}</span>
                                                        </div>
                                                    )}

                                                    {/* Price & CTA */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                                                        <div className="text-3xl font-black text-foreground tracking-tighter">₵{product.price.toFixed(2)}</div>
                                                        <div className="px-6 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-lg">
                                                            View
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-24 bg-surface rounded-[3rem] border border-dashed border-surface-border"
                        >
                            <div className="text-8xl mb-6 opacity-20">🔍</div>
                            <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">No Items Found</h3>
                            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs mb-8">
                                Try adjusting your filters
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedHotspot('');
                                    setSpicyLevel('');
                                    setCondition('');
                                    setShowActiveOnly(false);
                                }}
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest omni-glow active:scale-95 transition-all"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
