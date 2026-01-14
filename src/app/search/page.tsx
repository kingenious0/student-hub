// src/app/search/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/marketplace/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, CloseIcon } from '@/components/ui/Icons';
import Link from 'next/link';

function SearchResults() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        if (initialQuery) {
            handleSearch(initialQuery);
        }
    }, [initialQuery]);

    const handleSearch = async (q: string) => {
        if (!q.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
                setVisibleCount(12); // Reset pagination on new search
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pt-40 pb-20">
            {/* Search Header */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="text-foreground/40 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest">
                        ← Back to Market
                    </Link>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <SearchIcon className="w-6 h-6 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                        placeholder="Search for food, gadgets, fashion..."
                        className="w-full pl-16 pr-6 py-8 bg-surface border border-surface-border rounded-[2rem] text-2xl font-black placeholder-foreground/10 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setProducts([]); }}
                            className="absolute inset-y-0 right-6 flex items-center text-foreground/20 hover:text-red-500 transition-colors"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Scanning Database...</p>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/40">
                                Findings ({products.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {products.slice(0, visibleCount).map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination / Load More */}
                        {products.length > visibleCount && (
                            <div className="mt-16 flex justify-center">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 12)}
                                    className="px-12 py-5 bg-surface border border-surface-border rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all omni-glow active:scale-95 shadow-xl"
                                >
                                    Load More Results
                                </button>
                            </div>
                        )}
                    </>
                ) : query && !loading ? (
                    <div className="text-center py-32">
                        <div className="text-6xl mb-6 opacity-20">📡</div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground/20 mb-2">No Signals Detected</h2>
                        <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Try a different frequency or keyword</p>
                    </div>
                ) : (
                    <div className="text-center py-32 opacity-20">
                        <SearchIcon className="w-20 h-20 mx-auto mb-6" />
                        <h2 className="text-xl font-black uppercase tracking-widest">Enter Access Code / Search Terms</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
}
