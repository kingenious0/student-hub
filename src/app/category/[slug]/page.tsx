'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import CategoryHero from '@/components/marketplace/CategoryHero';
import EnhancedProductCard from '@/components/marketplace/EnhancedProductCard';
import MobileBackButton from '@/components/ui/MobileBackButton';

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

const categoryConfig = [
    { slug: 'food', name: 'Food & Snacks', icon: '🍕' },
    { slug: 'tech', name: 'Tech & Gadgets', icon: '💻' },
    { slug: 'fashion', name: 'Fashion', icon: '👕' },
    { slug: 'books', name: 'Books & Notes', icon: '📚' },
    { slug: 'services', name: 'Services', icon: '⚡' },
    { slug: 'beauty', name: 'Beauty & Health', icon: '💄' },
    { slug: 'sports', name: 'Sports & Fitness', icon: '⚽' },
    { slug: 'other', name: 'Everything Else', icon: '🎯' }
];

export default function CategoryHubPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug: rawSlug } = use(params);

    // Normalize legacy slugs to new premium hubs
    const slugMap: Record<string, string> = {
        'food-and-snacks': 'food',
        'tech-and-gadgets': 'tech',
        'books-and-notes': 'books',
        'everything-else': 'other'
    };
    const slug = slugMap[rawSlug] || rawSlug;
    const { addToCart } = useCart();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [visibleCount, setVisibleCount] = useState(12);

    // Filter states
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [selectedHotspot, setSelectedHotspot] = useState<string>('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);

    // Category-specific filters
    const [spicyLevel, setSpicyLevel] = useState<string>('');
    const [condition, setCondition] = useState<string>('');
    const [activeQuickFilter, setActiveQuickFilter] = useState<string>('');

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
                if (data.category.products.length > 0) {
                    const prices = data.category.products.map((p: Product) => p.price);
                    setPriceRange([0, Math.max(...prices)]);
                }
            } else {
                // Fallback for empty/unseeded category
                const fallback = categoryConfig.find(c => c.slug === slug);
                if (fallback) {
                    setCategory({
                        id: 'virtual-' + slug,
                        name: fallback.name,
                        slug: fallback.slug,
                        icon: fallback.icon,
                        description: 'Category hub',
                        products: []
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch category hub:', error);
            // Fallback on error too
            const fallback = categoryConfig.find(c => c.slug === slug);
            if (fallback) {
                setCategory({
                    id: 'virtual-' + slug,
                    name: fallback.name,
                    slug: fallback.slug,
                    icon: fallback.icon,
                    description: 'Category hub',
                    products: []
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!category) return;
        let filtered = [...category.products];

        if (selectedHotspot) filtered = filtered.filter(p => p.hotspot === selectedHotspot);
        if (showActiveOnly) filtered = filtered.filter(p => p.vendor.isAcceptingOrders);
        if (slug === 'food' && spicyLevel) filtered = filtered.filter(p => p.details?.spicyLevel === spicyLevel);
        if (slug === 'tech' && condition) filtered = filtered.filter(p => p.details?.condition === condition);

        switch (sortBy) {
            case 'newest': filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
            case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
        }
        setFilteredProducts(filtered);
    };

    const handleQuickFilter = (filter: string) => {
        setActiveQuickFilter(filter);
        // Apply filter logic based on category
        if (slug === 'food') {
            // Food quick filters: Breakfast, Lunch, Dinner, Snacks, Drinks
            // For now, just set as active - can be expanded later
        }
    };

    // Get quick filters based on category
    const getQuickFilters = () => {
        switch (slug) {
            case 'food':
                return ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];
            case 'tech':
                return ['Laptops', 'Phones', 'Accessories', 'Gaming'];
            case 'fashion':
                return ['Men', 'Women', 'Unisex', 'Accessories'];
            case 'services':
                return ['Cleaning', 'Tutoring', 'Delivery', 'Tech Support'];
            case 'books':
                return ['Textbooks', 'Notes', 'Study Guides', 'Stationery'];
            case 'beauty':
                return ['Makeup', 'Skincare', 'Hair', 'Perfumes'];
            case 'sports':
                return ['Gym Gear', 'Jerseys', 'Equipment', 'Supplements'];
            default:
                return [];
        }
    };

    // Category "Energy Color" System - King Kong Edition
    const getCategoryTheme = () => {
        switch (slug) {
            case 'food':
                return {
                    bg: 'from-orange-500/10 to-red-500/10',
                    text: 'text-[#FF4D00]',
                    icon: '🍕',
                    energy: '#FF4D00', // Sunset Orange
                    shadow: 'hover:shadow-[0_8px_30px_rgb(255,77,0,0.2)]',
                    glow: 'group-hover:shadow-[0_0_20px_rgba(255,77,0,0.15)]',
                    badge: 'bg-[#FF4D00]',
                    border: 'group-hover:border-[#FF4D00]/50',
                    accent: 'from-[#FF4D00]/10'
                };
            case 'tech':
                return {
                    bg: 'from-blue-500/10 to-cyan-500/10',
                    text: 'text-[#0070FF]',
                    icon: '💻',
                    energy: '#0070FF', // Cyber Blue
                    shadow: 'hover:shadow-[0_8px_30px_rgb(0,112,255,0.2)]',
                    glow: 'group-hover:shadow-[0_0_20px_rgba(0,112,255,0.15)]',
                    badge: 'bg-[#0070FF]',
                    border: 'group-hover:border-[#0070FF]/50',
                    accent: 'from-[#0070FF]/10'
                };
            case 'fashion':
                return {
                    bg: 'from-purple-500/10 to-pink-500/10',
                    text: 'text-[#A333FF]',
                    icon: '👕',
                    energy: '#A333FF', // Electric Purple
                    shadow: 'hover:shadow-[0_8px_30px_rgb(163,51,255,0.2)]',
                    glow: 'group-hover:shadow-[0_0_20px_rgba(163,51,255,0.15)]',
                    badge: 'bg-[#A333FF]',
                    border: 'group-hover:border-[#A333FF]/50',
                    accent: 'from-[#A333FF]/10'
                };
            case 'books':
                return {
                    bg: 'from-green-500/10 to-emerald-500/10',
                    text: 'text-[#2ECC71]',
                    icon: '📚',
                    energy: '#2ECC71', // Academic Green
                    shadow: 'hover:shadow-[0_8px_30px_rgb(46,204,113,0.2)]',
                    glow: 'group-hover:shadow-[0_0_20px_rgba(46,204,113,0.15)]',
                    badge: 'bg-[#2ECC71]',
                    border: 'group-hover:border-[#2ECC71]/50',
                    accent: 'from-[#2ECC71]/10'
                };
            case 'services':
                return {
                    bg: 'from-yellow-500/10 to-orange-500/10',
                    text: 'text-yellow-500',
                    icon: '⚡',
                    energy: '#FFD700',
                    shadow: 'hover:shadow-[0_8px_30px_rgb(255,215,0,0.2)]',
                    glow: 'group-hover:shadow-[0_0_20px_rgba(255,215,0,0.15)]',
                    badge: 'bg-yellow-500',
                    border: 'group-hover:border-yellow-500/50',
                    accent: 'from-yellow-500/10'
                };
            case 'beauty':
                return {
                    bg: 'from-pink-500/10 to-rose-500/10',
                    text: 'text-pink-500',
                    icon: '💄',
                    energy: '#EC4899',
                    shadow: 'hover:shadow-[0_8px_30px_rgb(236,72,153,0.2)]',
                    glow: 'group-hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]',
                    badge: 'bg-pink-500',
                    border: 'group-hover:border-pink-500/50',
                    accent: 'from-pink-500/10'
                };
            case 'sports':
                return {
                    bg: 'from-emerald-500/10 to-teal-500/10',
                    text: 'text-emerald-500',
                    icon: '⚽',
                    energy: '#10B981',
                    shadow: 'hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)]',
                    glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
                    badge: 'bg-emerald-500',
                    border: 'group-hover:border-emerald-500/50',
                    accent: 'from-emerald-500/10'
                };
            default:
                return {
                    bg: 'from-primary/10 to-primary/5',
                    text: 'text-primary',
                    icon: '🎯',
                    energy: '#39FF14',
                    shadow: 'hover:shadow-[0_8px_30px_rgba(57,255,20,0.2)]',
                    glow: 'group-hover:shadow-[0_0_20px_rgba(57,255,20,0.15)]',
                    badge: 'bg-primary',
                    border: 'group-hover:border-primary/50',
                    accent: 'from-primary/10'
                };
        }
    };

    const theme = getCategoryTheme();
    const hotspots = Array.from(new Set(category?.products.map(p => p.hotspot).filter(Boolean) as string[]));

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin omni-glow"></div>
        </div>
    );

    if (!category) return <div>Category not found</div>;

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* KING KONG CONTAINER - Max Width 7xl for Ultra-Wide */}
            <div className="max-w-7xl mx-auto pt-24 pb-24 px-3 md:px-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">

                    {/* SLIM DESKTOP SIDEBAR - King Kong Edition (192px) */}
                    <aside className="hidden md:block w-48 flex-shrink-0 space-y-6 sticky top-24 self-start h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-hide">
                        <Link
                            href="/marketplace"
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors mb-2 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Market
                        </Link>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-4">Department</h3>
                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">{category.name}</h1>
                        </div>

                        {/* Filter Sections */}
                        <div className="space-y-6">
                            {/* Hotspots */}
                            {hotspots.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-primary">Locations</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="hotspot" checked={selectedHotspot === ''} onChange={() => setSelectedHotspot('')} className="accent-primary" />
                                            <span className={`text-xs font-bold ${selectedHotspot === '' ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground'}`}>All Campus</span>
                                        </label>
                                        {hotspots.map(h => (
                                            <label key={h} className="flex items-center gap-2 cursor-pointer group">
                                                <input type="radio" name="hotspot" checked={selectedHotspot === h} onChange={() => setSelectedHotspot(h)} className="accent-primary" />
                                                <span className={`text-xs font-bold ${selectedHotspot === h ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground'}`}>{h}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sort */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-primary">Sort By</h4>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="w-full bg-surface border border-surface-border rounded-lg p-2 text-xs font-bold focus:outline-none"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>

                            {/* Active Only Switch */}
                            <div className="flex items-center gap-3 p-3 bg-surface border border-surface-border rounded-xl">
                                <div className={`w-3 h-3 rounded-full ${showActiveOnly ? 'bg-green-500 animate-pulse' : 'bg-foreground/20'}`}></div>
                                <span className="text-xs font-bold uppercase flex-1">Active Vendors</span>
                                <input type="checkbox" checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} className="accent-primary h-4 w-4" />
                            </div>
                        </div>
                    </aside>

                    {/* MAIN PRODUCT FEED - King Kong Edition */}
                    <main className="flex-1 min-w-0">
                        <MobileBackButton />

                        {/* Category Hero Section */}
                        <CategoryHero
                            categoryName={category.name}
                            categorySlug={slug}
                            categoryIcon={category.icon || '📦'}
                            description={category.description || undefined}
                            stats={{
                                productCount: filteredProducts.length,
                                vendorCount: Array.from(new Set(category.products.map(p => p.vendor.id))).length,
                                avgDeliveryTime: '15m'
                            }}
                            quickFilters={getQuickFilters()}
                            onQuickFilterClick={handleQuickFilter}
                        />

                        {/* Mobile Filter Pills - Horizontal Scroll */}
                        <div className="md:hidden mb-4 overflow-x-auto scrollbar-hide">
                            <div className="flex gap-2 pb-2">
                                <button
                                    onClick={() => setShowActiveOnly(!showActiveOnly)}
                                    className="px-4 py-2 rounded-full text-xs font-black uppercase whitespace-nowrap border-2 transition-all"
                                    style={{
                                        backgroundColor: showActiveOnly ? theme.energy : 'transparent',
                                        borderColor: theme.energy,
                                        color: showActiveOnly ? '#000' : theme.energy
                                    }}
                                >
                                    ⚡ Online
                                </button>
                                {hotspots.slice(0, 3).map(hotspot => (
                                    <button
                                        key={hotspot}
                                        onClick={() => setSelectedHotspot(selectedHotspot === hotspot ? null : hotspot)}
                                        className="px-4 py-2 rounded-full text-xs font-black uppercase whitespace-nowrap border-2 transition-all"
                                        style={{
                                            backgroundColor: selectedHotspot === hotspot ? theme.energy : 'transparent',
                                            borderColor: theme.energy,
                                            color: selectedHotspot === hotspot ? '#000' : theme.energy
                                        }}
                                    >
                                        📍 {hotspot}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Premium Category Header */}
                        <div className="mb-6 md:mb-8">
                            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
                                {category.name} <span style={{ color: theme.energy }}>.</span>
                            </h1>
                            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-2">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Available
                            </p>
                        </div>

                        {/* Mobile Filter Drawer (Conditional) */}
                        <AnimatePresence>
                            {showFiltersMobile && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="md:hidden bg-surface border-b border-surface-border overflow-hidden mb-4"
                                >
                                    <div className="p-4 space-y-4">
                                        {/* Mobile version of filters here - simplified */}
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                                            className="w-full bg-background border border-surface-border rounded-lg p-3 font-bold text-sm"
                                        >
                                            <option value="newest">Newest Arrivals</option>
                                            <option value="price-low">Price: Low to High</option>
                                        </select>
                                        <button
                                            onClick={() => setShowActiveOnly(!showActiveOnly)}
                                            className={`w-full py-3 rounded-lg font-bold text-xs uppercase ${showActiveOnly ? 'bg-primary text-primary-foreground' : 'bg-background border border-surface-border'}`}
                                        >
                                            {showActiveOnly ? 'Showing Active Only' : 'Show All Types'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ULTRA-DENSE KING KONG GRID - 2 mobile, 3 tablet, 4 desktop, 5 ultra-wide */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                            {filteredProducts.slice(0, visibleCount).map((product, index) => (
                                <Link
                                    href={`/products/${product.id}`}
                                    key={product.id}
                                    className={`group relative bg-surface border border-surface-border/60 rounded-2xl overflow-hidden ${theme.border} ${theme.shadow} transition-all duration-300 flex flex-col`}
                                >
                                    {/* Category-Colored Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.accent} to-transparent opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none transition-opacity duration-300 z-[1]`} />

                                    {/* Floating "Student Deal" Badge - Category Energy Color */}
                                    {index % 3 === 0 && (
                                        <div className={`absolute top-2 right-2 ${theme.badge} text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-1 z-20 rounded-lg shadow-lg`}>
                                            Student Deal
                                        </div>
                                    )}

                                    {/* Image Container - Fixed 1:1 Aspect Ratio */}
                                    <div className="aspect-square relative bg-background/50 overflow-hidden">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl opacity-20">
                                                {category.icon}
                                            </div>
                                        )}

                                        {/* Enhanced Gradient Overlay with Category Energy */}
                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                        {/* Elite Quick-Add Button - Bottom Right */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className="absolute bottom-2 right-2 w-9 h-9 md:w-11 md:h-11 bg-[#39FF14] text-black rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(57,255,20,0.4)] hover:shadow-[0_6px_20px_rgba(57,255,20,0.6)] active:scale-90 transition-all md:translate-y-12 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 duration-300 z-30"
                                            title="Quick Add to Cart"
                                        >
                                            <span className="text-xl md:text-2xl font-black leading-none pb-0.5">+</span>
                                        </button>
                                    </div>

                                    {/* Elite Product Card Content */}
                                    <div className="p-3 md:p-4 flex flex-col flex-1 gap-1.5 relative z-10">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm md:text-base font-black text-foreground leading-tight line-clamp-2 min-h-[2.5em] uppercase tracking-tight">
                                                {product.title}
                                            </h3>
                                        </div>

                                        {/* Vendor Trust Badge */}
                                        <div className="text-[9px] md:text-[10px] text-foreground/40 font-bold uppercase tracking-wider truncate">
                                            ✓ {product.vendor.name || 'Verified Vendor'}
                                        </div>

                                        {/* Elite Price Section - Bottom Left with Shield */}
                                        <div className="mt-auto pt-3 flex items-end justify-between">
                                            <div className="flex items-end gap-2">
                                                <div>
                                                    <div className={`text-[9px] ${theme.text} font-black uppercase tracking-wider mb-0.5`}>Price</div>
                                                    <div className="text-xl md:text-2xl font-black text-foreground leading-none tracking-tighter">
                                                        ₵{product.price.toFixed(2)}
                                                    </div>
                                                </div>
                                                {/* Electric Green Shield - Safe Trade Signal */}
                                                <div className="text-2xl md:text-3xl relative mb-0.5" title="Shield Escrow Protected">
                                                    <span className="filter drop-shadow-[0_2px_4px_rgba(57,255,20,0.3)]">🛡️</span>
                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#39FF14] rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.6)]"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery Info */}
                                        {product.hotspot && (
                                            <div className="mt-1 pt-2 border-t border-surface-border text-[9px] font-bold text-foreground/40 uppercase tracking-wider flex items-center gap-1">
                                                <span>⚡ 15m to</span>
                                                <span className="truncate max-w-[80px]">{product.hotspot}</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {filteredProducts.length > visibleCount && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 12)}
                                    className="px-8 py-4 bg-surface border border-surface-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all omni-glow active:scale-95"
                                >
                                    Load More Discoveries
                                </button>
                            </div>
                        )}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-24 text-center">
                                <span className="text-6xl opacity-20">🔍</span>
                                <h3 className="text-xl font-black mt-4 uppercase">No products found</h3>
                                <button onClick={() => { }} className="text-primary text-xs font-bold mt-2 uppercase underline">Clear Filters</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
