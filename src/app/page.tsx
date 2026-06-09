'use client';

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import SmartFeed from "@/components/marketplace/SmartFeed";
import GlobalSearch from "@/components/navigation/GlobalSearch";
import ServicesShowcase from "@/components/services/ServicesShowcase";
import { Suspense } from "react";
import * as React from "react";
import { useScroll, useTransform } from "framer-motion";

const FlashSalesSection = dynamic(() => import("@/components/marketplace/FlashSalesSection"), {
    loading: () => (
        <div className="space-y-8">
            <div className="bg-surface border-y border-surface-border py-4 overflow-hidden -mx-4" />
            <div className="bg-surface rounded-[3rem] p-8 md:p-12 border border-surface-border">
                <div className="flex items-center gap-5 mb-12">
                    <div className="w-14 h-14 bg-foreground/10 rounded-2xl animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-foreground/10 rounded-lg animate-pulse" />
                        <div className="h-4 w-32 bg-foreground/10 rounded animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-foreground/5 rounded-2xl p-4">
                            <div className="aspect-square bg-foreground/10 rounded-xl mb-3 animate-pulse" />
                            <div className="h-4 bg-foreground/10 rounded mb-2 animate-pulse" />
                            <div className="h-6 w-20 bg-foreground/10 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    ),
});

export default function Home() {
  const { user, isLoaded } = useUser();
  const [dbRole, setDbRole] = React.useState<string | null>(null);
  const heroRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/users/me')
        .then(res => res.json())
        .then(data => setDbRole(data?.role || null))
        .catch(() => setDbRole(null));
    }
  }, [isLoaded, user]);
  const { scrollY } = useScroll();
  
  // Parallax values for hero elements
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const contentY = useTransform(scrollY, [0, 500], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // High performance tracking using raw style mutation instead of forcing full-page React re-renders at 60fps
  const handleMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden selection:bg-primary selection:text-primary-foreground relative">
      
      {/* 0. GLOBAL BACKGROUND PARTICLES - Optimized CSS animations to prevent CPU redraws & hydration mismatches */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 md:opacity-100">
        <div className="absolute w-[200px] h-[200px] md:w-[350px] md:h-[350px] bg-primary/5 rounded-full blur-[80px] md:blur-[100px] top-[15%] left-[10%] md:animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] top-[55%] right-[5%] hidden md:block md:animate-pulse" style={{ animationDuration: '14s' }} />
        <div className="absolute w-[320px] h-[320px] bg-primary/5 rounded-full blur-[90px] bottom-[15%] left-[20%] hidden md:block md:animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* 1. PREMIUM DYNAMIC HERO */}
      <motion.div 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        style={{ y: heroY, willChange: 'transform' }}
        className="relative pt-32 pb-24 px-4 overflow-hidden group/hero z-10"
      >
        {/* Premium Dark Minimalist Background - Apple/Stripe Aesthetic */}
        <div className="absolute inset-0 bg-[#050505]">
           {/* Single Elegant Static Radial Glow - 0% CPU/GPU overhead, highly sophisticated */}
           <div className="absolute top-[-20%] left-[15%] w-[70%] h-[80%] rounded-full bg-gradient-to-br from-orange-500/15 via-rose-600/10 to-transparent blur-[130px] pointer-events-none" />
           <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3D%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] opacity-[0.08] mix-blend-overlay pointer-events-none" />
           
           {/* Interactive Glow Follower - High performance translation using direct CSS variables (0 React re-renders) */}
           <div 
             className="absolute pointer-events-none w-[350px] h-[350px] bg-white opacity-0 group-hover/hero:opacity-[0.05] rounded-full blur-[80px] transition-opacity duration-700 hidden md:block"
             style={{
               left: '0px',
               top: '0px',
               transform: 'translate3d(calc(var(--mouse-x, 0px) - 175px), calc(var(--mouse-y, 0px) - 175px), 0)',
               willChange: 'transform',
             }}
           />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Main Headline */}
            <motion.div
              style={{ y: contentY, opacity, willChange: 'transform, opacity' }}
              className="mb-8 relative w-full px-4"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none italic uppercase select-none"
                style={{ 
                  textShadow: '0 8px 24px rgba(0,0,0,0.2)', 
                  willChange: 'transform, opacity' 
                }}
              >
                Campus<br className="sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30"> Market</span>
              </motion.h1>
            </motion.div>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/40 text-lg md:text-2xl font-bold mb-14 max-w-2xl leading-normal tracking-tight px-4"
            >
              The peer-to-peer digital hub powering the <span className="text-white">USTED</span> student economy. Buy, sell, and trade safely.
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

        {/* Dynamic Floating Elements - CSS only (zero JS cost) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
            <span className="absolute top-1/4 left-[5%] text-6xl select-none animate-float opacity-20" style={{ animationDelay: '0s', animationDuration: '6s' }}>👟</span>
            <span className="absolute top-1/2 right-[5%] text-6xl select-none animate-float opacity-20" style={{ animationDelay: '1s', animationDuration: '7s' }}>⚡</span>
            <span className="absolute bottom-1/4 left-[10%] text-6xl select-none animate-float opacity-20" style={{ animationDelay: '2s', animationDuration: '5s' }}>🔥</span>
            <span className="absolute bottom-1/2 right-[8%] text-6xl select-none animate-float opacity-20" style={{ animationDelay: '3s', animationDuration: '8s' }}>🛸</span>
            <span className="absolute top-1/3 right-[15%] text-6xl select-none animate-float opacity-20" style={{ animationDelay: '1.5s', animationDuration: '6.5s' }}>💎</span>
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
            </motion.div>
           
            <Suspense fallback={<div className="h-[600px] w-full bg-surface rounded-[3rem] animate-pulse border border-surface-border" />}>
              <SmartFeed />
           </Suspense>
        </section>
      </main>

      {/* SERVICES SHOWCASE */}
      <div className="bg-surface/50 border-y border-surface-border">
        <ServicesShowcase />
      </div>



      {/* Footer with Vendor/Runner CTAs */}
      <footer className="bg-surface border-t border-surface-border mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto mb-8 md:mb-12">
            {(!isLoaded || (user?.publicMetadata?.role !== 'VENDOR' && dbRole !== 'VENDOR')) && (
              <Link href="/become-vendor" className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-emerald-600 to-teal-700 text-primary-foreground p-8 md:p-12 transition-all hover:scale-[1.02] active:scale-95 block shadow-xl border border-primary/20">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-5xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>🏪</div>
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-2">Sell on LaHustle</h3>
                  <p className="text-primary-foreground/80 text-xs md:text-lg font-medium mb-6 max-w-lg leading-relaxed">
                    Open your shop, reach over 10,000+ campus students daily, and receive secure escrow payouts directly to your MoMo wallet instantly.
                  </p>
                  <span className="inline-block px-8 py-4 bg-primary-foreground text-primary font-black uppercase text-xs tracking-widest rounded-2xl group-hover:scale-105 transition-transform shadow-2xl">
                    Start Selling Now →
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Footer Links */}
          <div className="text-center text-foreground/40 text-sm">
            <p className="font-medium">© 2026 LaHustle Student Marketplace • Built for Students, by Students</p>
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


// Floating Icon Component for Hero with Scroll Parallax (Bypassed entirely on mobile)
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

