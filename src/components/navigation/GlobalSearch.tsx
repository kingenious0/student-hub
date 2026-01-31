'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchIcon, XIcon, StoreIcon, PackageIcon, ChevronRightIcon, TrendingUpIcon } from 'lucide-react';

// Manual debounce if hook missing
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function GlobalSearch({ className = "", variant = "navbar", dropdownMode = "absolute" }: { className?: string, variant?: "navbar" | "hero", dropdownMode?: "absolute" | "static" }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<{ products: any[], vendors: any[], categories: any[] } | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounceValue(query, 300);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch results
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.length < 1) {
                setResults(null);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.products) {
                        setResults(data);
                        setIsOpen(true);
                    } else {
                        // Handle unexpected structure
                        setResults({ products: [], vendors: [], categories: [] });
                    }
                } else {
                    setResults({ products: [], vendors: [], categories: [] });
                }
            } catch (error) {
                console.error('Search error', error);
                setResults({ products: [], vendors: [], categories: [] });
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // Check if we have results to navigate to, or just push to search page
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setIsOpen(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults(null);
        setIsOpen(false);
    };

    const isHero = variant === "hero";

    return (
        <div ref={searchRef} className={`relative z-[100] ${className} ${isHero ? 'w-full max-w-2xl' : 'w-full max-w-md'}`}>
            <form onSubmit={handleSearchSubmit} className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length > 0) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (query.length > 0) setIsOpen(true);
                    }}
                    placeholder="Search for products, brands and categories..."
                    className={`w-full transition-all duration-300 outline-none border border-transparent focus:border-orange-500/50
                        ${isHero
                            ? 'h-14 pl-12 pr-12 rounded-full bg-white text-gray-900 shadow-2xl text-lg font-medium placeholder:text-gray-400'
                            : 'h-10 pl-10 pr-10 rounded-lg bg-gray-100 dark:bg-surface-hover text-foreground focus:bg-background shadow-sm text-sm'
                        }
                    `}
                />

                {/* Search Icon */}
                <div className={`absolute left-0 top-0 h-full flex items-center justify-center pointer-events-none ${isHero ? 'w-14 text-orange-500' : 'w-10 text-foreground/40'}`}>
                    <SearchIcon className={isHero ? 'w-6 h-6' : 'w-4 h-4'} />
                </div>

                {/* Clear/Loading Icon */}
                <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center">
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : query.length > 0 ? (
                        <button type="button" onClick={clearSearch} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            <XIcon className="w-4 h-4 text-gray-400" />
                        </button>
                    ) : null}
                </div>

                {/* Hero Submit Button (Only for Hero variant) */}
                {isHero && (
                    <button type="submit" className="absolute right-2 top-2 bottom-2 bg-orange-500 text-white px-6 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                        Search
                    </button>
                )}
            </form>

            {/* Dropdown Results */}
            {isOpen && (results || query.length > 0) && (
                <div className={`${dropdownMode === 'absolute' ? 'absolute top-full left-0 right-0' : 'relative w-full'} mt-2 bg-white dark:bg-surface border border-gray-200 dark:border-surface-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[101]`}>

                    {/* Loading Skeleton */}
                    {isLoading && !results && (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!isLoading && results && results.products.length === 0 && results.vendors.length === 0 && results.categories.length === 0 && (
                        <div className="p-8 text-center text-foreground/40">
                            <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">No results found for "{query}"</p>
                        </div>
                    )}

                    {/* Results Content */}
                    {!isLoading && results && (
                        <div className="divide-y divide-gray-100 dark:divide-surface-border max-h-[70vh] overflow-y-auto">

                            {/* Categories */}
                            {results.categories.length > 0 && (
                                <div className="p-2">
                                    <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">Categories</h3>
                                    {results.categories.map(cat => (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug || cat.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors group"
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-surface-hover rounded-lg text-lg group-hover:scale-110 transition-transform">
                                                {cat.icon || '#'}
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{cat.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Vendors */}
                            {results.vendors.length > 0 && (
                                <div className="p-2">
                                    <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">Official Stores</h3>
                                    {results.vendors.map(vendor => (
                                        <Link
                                            key={vendor.id}
                                            href={`/search?vendorId=${vendor.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors group"
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <StoreIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-bold text-foreground">{vendor.shopName}</span>
                                                <span className="block text-[10px] text-blue-500 font-bold uppercase tracking-wide">Official Vendor</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Products */}
                            {results.products.length > 0 && (
                                <div className="p-2">
                                    <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">Products</h3>
                                    {results.products.map(product => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors group"
                                        >
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-background rounded-lg overflow-hidden flex-shrink-0 border border-transparent group-hover:border-orange-500/20 transition-colors">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-sm font-bold text-foreground truncate group-hover:text-orange-600 transition-colors">{product.title}</span>
                                                <div className="flex items-center justify-between mt-0.5">
                                                    <span className="text-[10px] text-foreground/40 font-bold uppercase">{product.vendor?.shopName || 'Unknown Vendor'}</span>
                                                    <span className="text-xs font-black text-orange-600">₵{product.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* See All */}
                            <Link
                                href={`/search?q=${encodeURIComponent(query)}`}
                                onClick={() => setIsOpen(false)}
                                className="block p-3 text-center text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
                            >
                                See all results for "{query}"
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
