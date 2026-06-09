'use client';

import { useState, useEffect, use, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import CategoryHero from '@/components/marketplace/CategoryHero';
import EnhancedProductCard from '@/components/marketplace/EnhancedProductCard';
import MobileBackButton from '@/components/ui/MobileBackButton';
import MobileFilterSheet from '@/components/marketplace/MobileFilterSheet';
import FilterPills from '@/components/marketplace/FilterPills';
import BackToTop from '@/components/marketplace/BackToTop';
import { useFilterUrlParam, useFilterUrlBool } from '@/hooks/useFilterUrlState';

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

function CategoryHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = use(params);

  const slugMap: Record<string, string> = {
    'food-and-snacks': 'food',
    'tech-and-gadgets': 'tech',
    'books-and-notes': 'books',
    'everything-else': 'other'
  };
  const slug = slugMap[rawSlug] || rawSlug;
  const addToCart = useCartStore((s) => s.addToCart);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  const [sortBy, setSortBy] = useFilterUrlParam('sort', 'newest');
  const [showActiveOnly, setShowActiveOnly] = useFilterUrlBool('active', false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const [spicyLevel, setSpicyLevel] = useState('');
  const [condition, setCondition] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('');

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      applyFilters();
    }
  }, [category, sortBy, showActiveOnly, spicyLevel, condition]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/categories/${slug}`);
      const data = await res.json();

      if (data.success) {
        setCategory(data.category);

      } else {
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
    if (activeQuickFilter === filter) {
      setActiveQuickFilter('');
      return;
    }
    setActiveQuickFilter(filter);
  };

  const clearAllFilters = useCallback(() => {
    setSortBy('newest');
    setShowActiveOnly(false);
    setSpicyLevel('');
    setCondition('');
    setActiveQuickFilter('');
  }, [setSortBy, setShowActiveOnly]);

  const getQuickFilters = () => {
    switch (slug) {
      case 'food': return ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];
      case 'tech': return ['Laptops', 'Phones', 'Accessories', 'Gaming'];
      case 'fashion': return ['Men', 'Women', 'Unisex', 'Accessories'];
      case 'services': return ['Cleaning', 'Tutoring', 'Delivery', 'Tech Support'];
      case 'books': return ['Textbooks', 'Notes', 'Study Guides', 'Stationery'];
      case 'beauty': return ['Makeup', 'Skincare', 'Hair', 'Perfumes'];
      case 'sports': return ['Gym Gear', 'Jerseys', 'Equipment', 'Supplements'];
      default: return [];
    }
  };

  const getCategoryTheme = () => {
    switch (slug) {
      case 'food': return { bg: 'from-orange-500/10 to-red-500/10', text: 'text-[#FF4D00]', icon: '🍕', energy: '#FF4D00', shadow: 'hover:shadow-[0_8px_30px_rgb(255,77,0,0.2)]', glow: 'group-hover:shadow-[0_0_20px_rgba(255,77,0,0.15)]', badge: 'bg-[#FF4D00]', border: 'group-hover:border-[#FF4D00]/50', accent: 'from-[#FF4D00]/10' };
      case 'tech': return { bg: 'from-blue-500/10 to-cyan-500/10', text: 'text-[#0070FF]', icon: '💻', energy: '#0070FF', shadow: 'hover:shadow-[0_8px_30px_rgb(0,112,255,0.2)]', glow: 'group-hover:shadow-[0_0_20px_rgba(0,112,255,0.15)]', badge: 'bg-[#0070FF]', border: 'group-hover:border-[#0070FF]/50', accent: 'from-[#0070FF]/10' };
      case 'fashion': return { bg: 'from-purple-500/10 to-pink-500/10', text: 'text-[#A333FF]', icon: '👕', energy: '#A333FF', shadow: 'hover:shadow-[0_8px_30px_rgb(163,51,255,0.2)]', glow: 'group-hover:shadow-[0_0_20px_rgba(163,51,255,0.15)]', badge: 'bg-[#A333FF]', border: 'group-hover:border-[#A333FF]/50', accent: 'from-[#A333FF]/10' };
      case 'books': return { bg: 'from-green-500/10 to-emerald-500/10', text: 'text-[#2ECC71]', icon: '📚', energy: '#2ECC71', shadow: 'hover:shadow-[0_8px_30px_rgb(46,204,113,0.2)]', glow: 'group-hover:shadow-[0_0_20px_rgba(46,204,113,0.15)]', badge: 'bg-[#2ECC71]', border: 'group-hover:border-[#2ECC71]/50', accent: 'from-[#2ECC71]/10' };
      case 'services': return { bg: 'from-yellow-500/10 to-orange-500/10', text: 'text-yellow-500', icon: '⚡', energy: '#FFD700', shadow: 'hover:shadow-[0_8px_30px_rgb(255,215,0,0.2)]', glow: 'group-hover:shadow-[0_0_20px_rgba(255,215,0,0.15)]', badge: 'bg-yellow-500', border: 'group-hover:border-yellow-500/50', accent: 'from-yellow-500/10' };
      case 'beauty': return { bg: 'from-pink-500/10 to-rose-500/10', text: 'text-pink-500', icon: '💄', energy: '#EC4899', shadow: 'hover:shadow-[0_8px_30px_rgb(236,72,153,0.2)]', glow: 'group-hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]', badge: 'bg-pink-500', border: 'group-hover:border-pink-500/50', accent: 'from-pink-500/10' };
      case 'sports': return { bg: 'from-emerald-500/10 to-teal-500/10', text: 'text-emerald-500', icon: '⚽', energy: '#10B981', shadow: 'hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)]', glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]', badge: 'bg-emerald-500', border: 'group-hover:border-emerald-500/50', accent: 'from-emerald-500/10' };
      default: return { bg: 'from-primary/10 to-primary/5', text: 'text-primary', icon: '🎯', energy: '#10B981', shadow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]', glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]', badge: 'bg-primary', border: 'group-hover:border-primary/50', accent: 'from-primary/10' };
    }
  };

  const theme = getCategoryTheme();
  const activeFilterPills = useMemo(() => {
    const pills: { label: string; onRemove: () => void }[] = [];
    if (sortBy !== 'newest') pills.push({ label: `Sort: ${sortBy}`, onRemove: () => setSortBy('newest') });
    if (showActiveOnly) pills.push({ label: 'Active Vendors', onRemove: () => setShowActiveOnly(false) });
    return pills;
  }, [sortBy, showActiveOnly, setSortBy, setShowActiveOnly]);

  const handleAddToCart = useCallback((product: Product) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      vendor: product.vendor ? { ...product.vendor, name: product.vendor.name || '' } : undefined,
    });
  }, [addToCart]);

  const filterSection = (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-primary">Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-surface border border-surface-border rounded-lg p-2 text-xs font-bold focus:outline-none"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Category-Specific Filters */}
      {slug === 'tech' && (
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-primary">Condition</h4>
          <div className="space-y-2">
            {['New', 'Like New', 'Good', 'Fair'].map(c => (
              <label key={c} className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="condition" checked={condition === c} onChange={() => setCondition(condition === c ? '' : c)} className="accent-primary" />
                <span className={`text-xs font-bold ${condition === c ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground'}`}>{c}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Active Only Switch */}
      <div className="flex items-center gap-3 p-3 bg-surface border border-surface-border rounded-xl">
        <div className={`w-3 h-3 rounded-full ${showActiveOnly ? 'bg-green-500 animate-pulse' : 'bg-foreground/20'}`}></div>
        <span className="text-xs font-bold uppercase flex-1">Active Vendors</span>
        <input type="checkbox" checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} className="accent-primary h-4 w-4" />
      </div>

      {/* Clear All */}
      {activeFilterPills.length > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-3 text-xs font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin lh-glow"></div>
    </div>
  );

  if (!category) return <div>Category not found</div>;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto pt-24 pb-24 px-3 md:px-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0 space-y-6 sticky top-24 self-start h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-hide">
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
            {filterSection}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <MobileBackButton />

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

            {/* Mobile: Filter Bar + Quick Filters */}
            <div className="md:hidden mb-4 space-y-3">
              {/* Filter Button Row */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                <button
                  onClick={() => setShowFiltersMobile(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black uppercase whitespace-nowrap border-2 transition-all shrink-0"
                  style={{
                    borderColor: theme.energy,
                    color: theme.energy,
                  }}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                  {activeFilterPills.length > 0 && (
                    <span
                      className="text-white text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: theme.energy }}
                    >
                      {activeFilterPills.length}
                    </span>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowActiveOnly(!showActiveOnly)}
                    className="px-4 py-2.5 rounded-full text-xs font-black uppercase whitespace-nowrap border-2 transition-all shrink-0"
                    style={{
                      backgroundColor: showActiveOnly ? theme.energy : 'transparent',
                      borderColor: theme.energy,
                      color: showActiveOnly ? '#000' : theme.energy,
                    }}
                  >
                    ⚡ Online
                  </button>

                </div>
              </div>

              {/* Active Filter Pills */}
              <FilterPills
                pills={activeFilterPills}
                onClearAll={clearAllFilters}
              />
            </div>

            {/* Desktop: Active Filter Pills */}
            <div className="hidden md:block mb-4">
              <FilterPills
                pills={activeFilterPills}
                onClearAll={clearAllFilters}
              />
            </div>

            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
                {category.name} <span style={{ color: theme.energy }}>.</span>
              </h1>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-2">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Available
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredProducts.slice(0, visibleCount).map((product, index) => (
                <EnhancedProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  category={category.name}
                  vendorName={product.vendor.name || 'Verified Vendor'}
                  stockQuantity={100}
                  deliveryTime="15m"
                  themeColor={theme.energy}
                  categoryIcon={category.icon || '📦'}
                  isStudentDeal={index % 3 === 0}
                  showShield={true}
                  onAddToCart={handleAddToCart(product)}
                />
              ))}
            </div>

            {/* Load More */}
            {filteredProducts.length > visibleCount && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-4 bg-surface border border-surface-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all lh-glow active:scale-95"
                >
                  Load More Discoveries
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <span className="text-6xl opacity-20">🔍</span>
                <h3 className="text-xl font-black mt-4 uppercase">No products found</h3>
                <p className="text-sm text-foreground/60 mt-2 mb-6">Try adjusting your filters</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Back to Top */}
      <BackToTop />

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={showFiltersMobile}
        onClose={() => setShowFiltersMobile(false)}
        title="Filters"
        activeCount={activeFilterPills.length}
      >
        {filterSection}
      </MobileFilterSheet>
    </div>
  );
}

export default function CategoryHubPageWrapper({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin lh-glow" />
      </div>
    }>
      <CategoryHubPage params={params} />
    </Suspense>
  );
}
