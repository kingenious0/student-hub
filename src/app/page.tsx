'use client';

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SearchIcon, ShoppingCartIcon, ChevronRightIcon } from "@/components/ui/Icons";

import SmartFeed from "@/components/marketplace/SmartFeed";
import GlobalSearch from "@/components/navigation/GlobalSearch";
import { Suspense } from "react";
import RefreshButton from "@/components/ui/RefreshButton";
import * as React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">

      {/* 1. PROMO HERO BANNER - Jumia Style */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 pt-32 pb-8 px-4">
        {/* Animated Background - Isolated Overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Promo */}
          <div className="text-center mb-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
              <span className="text-white font-black text-sm uppercase tracking-widest">🔥 Campus Flash Sale</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tighter drop-shadow-lg">
              Up to 60% OFF
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-bold mb-6">
              On Food, Tech & Fashion • Limited Time Only!
            </p>
            <Link href="/deals" className="inline-block bg-white text-orange-600 px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-transform shadow-2xl">
              Shop Deals Now →
            </Link>
          </div>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto">
            {/* Quick Search Bar */}
            <div className="max-w-2xl mx-auto">
              <GlobalSearch variant="hero" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK CATEGORIES - Clean Grid */}
      <div className="bg-background border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            <QuickCategoryCard href="/category/food" icon="🍔" label="Food" />
            <QuickCategoryCard href="/category/tech" icon="📱" label="Tech" />
            <QuickCategoryCard href="/category/fashion" icon="👟" label="Fashion" />
            <QuickCategoryCard href="/category/books" icon="📚" label="Books" />
            <QuickCategoryCard href="/category/services" icon="✂️" label="Services" />
            <QuickCategoryCard href="/category/beauty" icon="💄" label="Beauty" />
            <QuickCategoryCard href="/category/lifestyle" icon="🧘" label="Vibe" />
            <QuickCategoryCard href="/category/more" icon="+" label="More" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-12">

        {/* Flash Sales Section - Jumia Style with LIVE Countdown */}
        <section>
          <FlashSalesSection />
        </section>

        {/* Fresh Arrivals - Main Product Feed */}
        <section>
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              Fresh Arrivals
            </h2>
            <RefreshButton />
          </div>

          <Suspense fallback={<div className="h-96 w-full bg-surface/50 rounded-3xl animate-pulse"></div>}>
            <SmartFeed />
          </Suspense>
        </section>

      </main>

      {/* Footer with Vendor/Runner CTAs */}
      <footer className="bg-surface border-t border-surface-border mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-4 mb-8 md:mb-12">
            <Link href="/become-vendor" className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-5 md:p-10 transition-all hover:scale-[1.02] active:scale-95">
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="text-3xl md:text-4xl mb-2 md:mb-4">🏪</div>
                <h3 className="text-sm md:text-2xl font-black uppercase tracking-tight mb-1 md:mb-2">Sell on Omni</h3>
                <p className="text-white/80 text-[10px] md:text-sm font-medium mb-3 md:mb-6 line-clamp-2 md:line-clamp-none">Open your shop. Reach students.</p>
                <span className="inline-block px-4 py-2 md:px-6 md:py-3 bg-white text-indigo-600 font-black uppercase text-[10px] md:text-xs tracking-widest rounded-lg md:rounded-xl group-hover:scale-105 transition-transform">
                  Start Selling
                </span>
              </div>
            </Link>

            <Link href="/runner" className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-5 md:p-10 transition-all hover:scale-[1.02] active:scale-95">
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="text-3xl md:text-4xl mb-2 md:mb-4">⚡</div>
                <h3 className="text-sm md:text-2xl font-black uppercase tracking-tight mb-1 md:mb-2">Become Runner</h3>
                <p className="text-white/80 text-[10px] md:text-sm font-medium mb-3 md:mb-6 line-clamp-2 md:line-clamp-none">Earn money. Flexible hours.</p>
                <span className="inline-block px-4 py-2 md:px-6 md:py-3 bg-white text-emerald-600 font-black uppercase text-[10px] md:text-xs tracking-widest rounded-lg md:rounded-xl group-hover:scale-105 transition-transform">
                  Join Fleet
                </span>
              </div>
            </Link>
          </div>

          {/* Footer Links */}
          <div className="text-center text-foreground/40 text-sm">
            <p className="font-medium">© 2026 Omni Student Marketplace • Built for Students, by Students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


// Quick Category Card (Simplified Jumia Style)
function QuickCategoryCard({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-surface-border transition-all hover:scale-105 active:scale-95"
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="font-bold text-[10px] uppercase tracking-wide text-foreground/70">{label}</span>
    </Link>
  )
}

function CategoryCard({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all hover:scale-105 active:scale-95 ${color} bg-opacity-10 border-opacity-20 hover:bg-opacity-20`}
    >
      <span className="text-3xl mb-2 filter drop-shadow-sm">{icon}</span>
      <span className="font-black text-xs uppercase tracking-widest">{label}</span>
    </Link>
  )
}

// Flash Deal Card Component
function FlashDealCard({
  title,
  price,
  originalPrice,
  discount,
  stock
}: {
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
}) {
  const isLowStock = stock <= 5;

  return (
    <div className="bg-white rounded-2xl p-4 hover:scale-105 transition-transform cursor-pointer">
      {/* Discount Badge */}
      <div className="relative aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-black">
          -{discount}%
        </div>
        <div className="text-5xl">📦</div>
      </div>

      {/* Product Info */}
      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>

      {/* Price */}
      <div className="flex flex-col lg:flex-row lg:items-baseline gap-1 lg:gap-2 mb-2">
        <span className="text-lg lg:text-xl font-black text-orange-600">₵{price}</span>
        <span className="text-xs text-gray-400 line-through">₵{originalPrice}</span>
      </div>

      {/* Stock Indicator */}
      {isLowStock && (
        <div className="text-xs font-bold text-orange-600 animate-pulse">
          Only {stock} left!
        </div>
      )}
    </div>
  );
}

// Flash Sales Section with LIVE Countdown and REAL DATA
function FlashSalesSection() {
  const [timeLeft, setTimeLeft] = React.useState({ hours: 0, minutes: 0, seconds: 0 });
  const [flashSales, setFlashSales] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [endTime, setEndTime] = React.useState<Date | null>(null);

  // Fetch flash sales from API
  React.useEffect(() => {
    fetch('/api/flash-sales')
      .then(res => res.json())
      .then(data => {
        setFlashSales(data.flashSales || []);
        if (data.endTime) {
          setEndTime(new Date(data.endTime));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch flash sales:', error);
        setLoading(false);
      });
  }, []);

  // Update countdown timer
  React.useEffect(() => {
    if (!endTime) {
      // Fallback to tomorrow midnight if no flash sales
      const fallbackEndTime = new Date();
      fallbackEndTime.setDate(fallbackEndTime.getDate() + 1);
      fallbackEndTime.setHours(0, 0, 0, 0);
      setEndTime(fallbackEndTime);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // Don't show section if no flash sales
  if (!loading && flashSales.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 md:p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚡</div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              Flash Sales
            </h2>
            <p className="text-white/80 text-sm font-bold">
              Limited time offers • Hurry up!
            </p>
          </div>
        </div>

        {/* LIVE Countdown Timer */}
        <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wide">Ends in</span>
          <div className="flex items-center gap-1">
            <div className="flex flex-col items-center bg-white/30 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[3rem]">
              <span className="text-2xl font-black leading-none tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold uppercase opacity-80">h</span>
            </div>
            <span className="text-xl font-black">:</span>
            <div className="flex flex-col items-center bg-white/30 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[3rem]">
              <span className="text-2xl font-black leading-none tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold uppercase opacity-80">m</span>
            </div>
            <span className="text-xl font-black">:</span>
            <div className="flex flex-col items-center bg-white/30 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[3rem]">
              <span className="text-2xl font-black leading-none tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold uppercase opacity-80">s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Products */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/20 rounded-2xl p-4 animate-pulse">
              <div className="aspect-square bg-white/30 rounded-xl mb-3"></div>
              <div className="h-4 bg-white/30 rounded mb-2"></div>
              <div className="h-6 bg-white/30 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {flashSales.slice(0, 4).map((sale) => (
            <Link
              key={sale.id}
              href={`/products/${sale.product.id}`}
              className="bg-white rounded-2xl p-4 hover:scale-105 transition-transform cursor-pointer"
            >
              {/* Discount Badge */}
              <div className="relative aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-black z-10">
                  -{sale.discountPercent}%
                </div>
                {sale.product.imageUrl ? (
                  <img
                    src={sale.product.imageUrl}
                    alt={sale.product.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-5xl">📦</div>
                )}
              </div>

              {/* Product Info */}
              <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                {sale.product.title}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-black text-orange-600">
                  ₵{sale.salePrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ₵{sale.originalPrice.toFixed(2)}
                </span>
              </div>

              {/* Stock Indicator */}
              {sale.stockRemaining <= 5 && sale.stockRemaining > 0 && (
                <div className="text-xs font-bold text-orange-600 animate-pulse">
                  Only {sale.stockRemaining} left!
                </div>
              )}
              {sale.stockRemaining > 5 && (
                <div className="text-xs text-green-600 font-bold">
                  In Stock
                </div>
              )}
              {sale.stockRemaining === 0 && (
                <div className="text-xs text-red-600 font-bold">
                  Sold Out
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* View All Link */}
      <div className="text-center">
        <Link
          href="/deals"
          className="inline-block bg-white text-orange-600 px-8 py-3 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-lg"
        >
          See All Flash Deals →
        </Link>
      </div>
    </div>
  );
}
