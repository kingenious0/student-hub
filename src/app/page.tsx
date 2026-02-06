'use client';

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SearchIcon, ShoppingCartIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { motion, AnimatePresence } from "framer-motion";

import SmartFeed from "@/components/marketplace/SmartFeed";
import GlobalSearch from "@/components/navigation/GlobalSearch";
import { Suspense } from "react";
import RefreshButton from "@/components/ui/RefreshButton";
import * as React from "react";
import { useScroll, useTransform } from "framer-motion";

export default function Home() {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const heroRef = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax values for hero elements
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const contentY = useTransform(scrollY, [0, 500], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden selection:bg-primary selection:text-primary-foreground relative">
      
      {/* 0. GLOBAL BACKGROUND PARTICLES */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {[...Array(6)].map((_, i) => (
           <motion.div
             key={i}
             animate={{
               y: [0, -100, 0],
               x: [0, 50, 0],
               opacity: [0.03, 0.08, 0.03],
               scale: [1, 1.2, 1]
             }}
             transition={{
               duration: 10 + i * 2,
               repeat: Infinity,
               ease: "easeInOut"
             }}
             className="absolute w-64 h-64 bg-primary/10 rounded-full blur-[80px]"
             style={{
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`,
             }}
           />
         ))}
      </div>

      {/* 1. PREMIUM DYNAMIC HERO */}
      <motion.div 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        style={{ y: heroY }}
        className="relative pt-32 pb-24 px-4 overflow-hidden group/hero z-10"
      >
        {/* Dynamic Animated Background - Optimized Surface */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-rose-600 to-[#0a0a0a]">
           <motion.div 
             animate={{ 
               scale: [1, 1.5, 1],
               rotate: [0, 180, 0],
             }}
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             className="absolute -top-1/4 -left-1/4 w-[120%] h-[120%] bg-orange-600 rounded-full blur-[180px] opacity-30 mix-blend-screen"
           />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
           
           {/* Interactive Glow Follower */}
           <motion.div 
             className="absolute pointer-events-none w-[800px] h-[800px] bg-white opacity-0 group-hover/hero:opacity-[0.07] rounded-full blur-[150px] transition-opacity duration-700"
             animate={{
               x: mousePos.x - 400,
               y: mousePos.y - 400,
             }}
             transition={{ type: "spring", damping: 40, stiffness: 80 }}
           />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Tagline */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 mb-8"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-gray-800 overflow-hidden shadow-xl">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+50}`} alt="user" />
                  </div>
                ))}
              </div>
              <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Verified Campus Vibes</span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              style={{ y: contentY, opacity }}
              className="mb-8 relative"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[12vw] md:text-[14rem] font-black text-white tracking-tighter leading-[0.75] italic uppercase select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              >
                Zero<br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/50 to-transparent">Limits</span>
              </motion.h1>
              
              <motion.div 
                initial={{ rotate: 15, scale: 0 }}
                animate={{ 
                  rotate: [-12, -8, -12],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  initial: { type: "spring", delay: 1 }
                }}
                className="absolute -top-10 -right-10 md:top-0 md:right-0 bg-[#39FF14] text-black px-6 py-3 rounded-2xl font-black text-2xl md:text-4xl shadow-[0_0_50px_rgba(57,255,20,0.5)] border-4 border-black z-20 cursor-default hover:scale-125 transition-transform"
              >
                60% OFF
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/40 text-xl md:text-3xl font-bold mb-14 max-w-2xl leading-none tracking-tight"
            >
              The digital hub for the <span className="text-white">AAMUSTED</span> underground economy.
            </motion.p>

            {/* CTA Button with Liquid Gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
               <Link href="/deals" className="relative group px-12 py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.3em] text-xs transition-all overflow-hidden inline-block active:scale-95">
                  <span className="relative z-10">Start Digging Deals →</span>
                  <motion.div 
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent skew-x-12"
                  />
               </Link>
            </motion.div>

            {/* Search Integration with 3D Physics */}
            <motion.div 
              whileHover={{ rotateX: 5, rotateY: -5 }}
              style={{ perspective: 1200 }}
              className="w-full max-w-4xl mt-20"
            >
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="glass-strong p-3 rounded-[3rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] border border-white/5"
              >
                <GlobalSearch variant="hero" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Floating Elements with Parallax */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
           <FloatingIcon icon="👟" className="top-1/4 left-[5%]" delay={0.5} depth={0.2} />
           <FloatingIcon icon="⚡" className="top-1/2 right-[5%]" delay={2.5} depth={-0.1} />
           <FloatingIcon icon="🔥" className="bottom-1/4 left-[10%]" delay={1.8} depth={0.3} />
           <FloatingIcon icon="🛸" className="bottom-1/2 right-[8%]" delay={3.2} depth={-0.2} />
           <FloatingIcon icon="💎" className="top-1/3 right-[15%]" delay={4.1} depth={0.15} />
        </div>
      </motion.div>

      {/* 2. LIVE TRENDING FEED */}
      <FlashSalesSection />

      {/* 3. DYNAMIC CATEGORY BAR */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ margin: "-100px" }}
        className="sticky top-[72px] z-30 bg-background/60 backdrop-blur-3xl border-b border-surface-border"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth snap-x">
             <CategoryPill href="/category/food" icon="🍔" label="Cravings" active />
             <CategoryPill href="/category/tech" icon="🔋" label="Gear" />
             <CategoryPill href="/category/fashion" icon="💎" label="Drip" />
             <CategoryPill href="/category/books" icon="🧠" label="Grind" />
             <CategoryPill href="/category/services" icon="🛠️" label="Deeds" />
             <CategoryPill href="/category/beauty" icon="✨" label="Glow" />
             <CategoryPill href="/category/lifestyle" icon="🌊" label="Vibe" />
             <CategoryPill href="/category/more" icon="+" label="Exploration" />
          </div>
        </div>
      </motion.div>

      {/* MAIN FEED */}
      <main className="max-w-7xl mx-auto px-4 py-24 z-10 relative">
        <section className="space-y-12">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-6"
           >
              <div>
                 <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">Real-time Hub</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">Fresh <span className="text-foreground/20">Supply</span></h2>
              </div>
              <RefreshButton />
           </motion.div>
           
           <Suspense fallback={<div className="h-[600px] w-full glass rounded-[3rem] animate-pulse" />}>
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

// Quick Category Pill (New)
function CategoryPill({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all snap-start
        ${active 
          ? 'bg-primary border-primary text-black shadow-[0_0_20px_var(--primary-glow)] font-black' 
          : 'bg-surface border-surface-border text-foreground/40 hover:border-primary/30 hover:bg-white hover:text-foreground'
        }
      `}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </Link>
  )
}


// Floating Icon Component for Hero with Scroll Parallax
function FloatingIcon({ icon, className, delay, depth = 0.1 }: { icon: string; className: string; delay: number; depth?: number }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * depth]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  return (
    <motion.div
      style={{ y, rotate }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.2, 0.1], 
        scale: 1,
        y: [0, -20, 0] 
      }}
      transition={{ 
        opacity: { duration: 1, delay },
        scale: { duration: 0.5, delay },
        y: { 
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 2
        }
      }}
      className={`absolute text-6xl select-none filter blur-[1px] hover:blur-0 transition-all duration-700 ${className}`}
    >
      {icon}
    </motion.div>
  )
}

// Quick Category Card (Animated)
function QuickCategoryCard({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <Link
        href={href}
        className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-surface hover:bg-white border border-surface-border transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-95"
      >
        <div className="relative mb-2 transition-transform group-hover:scale-125 group-hover:-rotate-12 duration-300">
           <span className="text-3xl relative z-10">{icon}</span>
           <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-black text-[9px] uppercase tracking-widest text-foreground/50 group-hover:text-primary transition-colors">{label}</span>
      </Link>
    </motion.div>
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

// Flash Deal Card Component (Animated)
function FlashDealCard({
  title,
  price,
  originalPrice,
  discount,
  stock,
  imageUrl
}: {
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  imageUrl?: string;
}) {
  const isLowStock = stock <= 5;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white dark:bg-surface rounded-3xl p-4 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] cursor-pointer border border-surface-border group"
    >
      {/* Discount Badge */}
      <div className="relative aspect-square bg-gray-100 dark:bg-black rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
        <div className="absolute top-2 left-2 bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-black z-10 shadow-lg">
          -{discount}%
        </div>
        
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="text-6xl group-hover:scale-125 transition-transform duration-500">📦</div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Product Info */}
      <h3 className="text-sm font-black text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-black text-rose-600">₵{price}</span>
        <span className="text-xs text-foreground/30 line-through font-bold">₵{originalPrice}</span>
      </div>

      {/* Stock Indicator */}
      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${(stock/20)*100}%` }}
           className={`h-full ${isLowStock ? 'bg-orange-500' : 'bg-emerald-500'}`}
         />
      </div>
      <p className={`text-[9px] font-black uppercase tracking-widest ${isLowStock ? 'text-orange-500' : 'text-foreground/40'}`}>
        {isLowStock ? `Only ${stock} left` : 'In Stock'}
      </p>
    </motion.div>
  );
}

// Flash Sales Section with LIVE Countdown and REAL DATA
function FlashSalesSection() {
  const [timeLeft, setTimeLeft] = React.useState({ hours: 0, minutes: 0, seconds: 0 });
  const [flashSales, setFlashSales] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [endTime, setEndTime] = React.useState<Date | null>(null);

  // Trending Marquee Items
  const trending = ["Iphone 16", "Fried Rice", "Macbook Air", "Sneakers", "T-Shirts", "Hostels", "Laptops"];

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
      const fallbackEndTime = new Date();
      fallbackEndTime.setDate(fallbackEndTime.getDate() + 1);
      fallbackEndTime.setHours(0, 0, 0, 0);
      setEndTime(fallbackEndTime);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="space-y-8">
      {/* 1. Trending Marquee */}
      <div className="bg-surface border-y border-surface-border py-4 overflow-hidden -mx-4">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12"
        >
          {[...trending, ...trending, ...trending].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Trending</span>
              <span className="text-sm font-black italic">{item}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          ))}
        </motion.div>
      </div>

      <div className="bg-[#0a0a0a] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-3xl animate-pulse shadow-[0_0_30px_rgba(225,29,72,0.4)]">
              ⚡
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none mb-2">
                Flash <span className="text-rose-600">Sales</span>
              </h2>
              <div className="flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                 </span>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Live Promotions</p>
              </div>
            </div>
          </div>

          {/* LIVE Countdown Timer */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              {[
                { val: timeLeft.hours, label: 'h' },
                { val: timeLeft.minutes, label: 'm' },
                { val: timeLeft.seconds, label: 's' }
              ].map((t, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center min-w-[3.5rem]">
                    <span className="text-3xl font-black tabular-nums leading-none mb-1">
                      {String(t.val).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">{t.label}</span>
                  </div>
                  {idx < 2 && <span className="text-2xl font-black opacity-20">:</span>}
                </React.Fragment>
              ))}
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
    </div>
  );
}