'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedProductCard from '@/components/marketplace/EnhancedProductCard';
import { SearchIcon } from '@/components/ui/Icons';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  hotspot: string | null;
  averageRating: number | null;
  totalReviews: number;
  stockQuantity: number;
  isInStock: boolean;
  vendor: {
    id: string;
    name: string | null;
    shopName: string | null;
    isAcceptingOrders: boolean;
    currentHotspot: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
}

const categories = [
  { slug: 'all', name: 'All Products', icon: '🎯' },
  { slug: 'food', name: 'Food & Snacks', icon: '🍕' },
  { slug: 'tech', name: 'Tech & Gadgets', icon: '💻' },
  { slug: 'fashion', name: 'Fashion', icon: '👕' },
  { slug: 'books', name: 'Books & Notes', icon: '📚' },
  { slug: 'services', name: 'Services', icon: '⚡' },
  { slug: 'beauty', name: 'Beauty & Health', icon: '💄' },
  { slug: 'sports', name: 'Sports & Fitness', icon: '⚽' },
  { slug: 'other', name: 'Everything Else', icon: '🎁' }
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async (pageNum: number, reset: boolean) => {
    if (reset) { setLoading(true); setProducts([]); }
    else { setLoadingMore(true); }

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('sort', sortBy);
      params.append('page', String(pageNum));
      params.append('pageSize', '20');
      if (searchQuery) params.append('q', searchQuery);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        if (reset) {
          setProducts(data.products);
        } else {
          setProducts(prev => [...prev, ...data.products]);
        }
        setHasMore(data.pagination?.hasMore || false);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, false);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="text-foreground/40 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest">
              ← Back Home
            </Link>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Marketplace
          </h1>
          <p className="text-foreground/60 text-lg">
            Browse all products from verified campus vendors
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-surface border border-surface-border rounded-3xl p-6 mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-4 bg-background border border-surface-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'bg-background border border-surface-border hover:border-primary/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground/60">Sort by:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'rating', label: 'Top Rated' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    sortBy === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-surface-border hover:border-primary/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 px-2">
          <p className="text-sm font-black uppercase tracking-wider text-foreground/60">
            {loading ? 'Loading...' : `${total} Products Found`}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-surface/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">📦</div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground/40 mb-2">
              No Products Found
            </h3>
            <p className="text-foreground/60 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSortBy('newest');
              }}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <EnhancedProductCard
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      imageUrl={product.imageUrl}
                      category={product.category.name}
                      vendorName={product.vendor.shopName || product.vendor.name || 'Vendor'}
                      stockQuantity={product.stockQuantity}
                      averageRating={product.averageRating || undefined}
                      totalReviews={product.totalReviews}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-12 py-5 bg-surface border-2 border-surface-border rounded-2xl font-black text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
