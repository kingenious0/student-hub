'use client';

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import SmartFeed from "@/components/marketplace/SmartFeed";
import GlobalSearch from "@/components/navigation/GlobalSearch";
import ServicesShowcase from "@/components/services/ServicesShowcase";
import { Suspense } from "react";
import * as React from "react";
import { useScroll, useTransform } from "framer-motion";
import CategoriesMarquee from "@/components/marketplace/CategoriesMarquee";



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
  const router = useRouter();
  const [dbRole, setDbRole] = React.useState<string | null>(null);
  const heroRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isLoaded && user) {
      router.push('/marketplace');
    }
  }, [isLoaded, user, router]);

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

      {/* 1. PREMIUM DYNAMIC HERO - GoCart Inspired Hybrid Bento Layout */}
      <motion.div 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        style={{ y: heroY, willChange: 'transform' }}
        className="relative pt-32 pb-16 px-4 overflow-hidden group/hero z-10"
      >
        {/* Premium Minimalist Background that conforms to light/dark themes */}
        <div className="absolute inset-0 bg-background">
           {/* Single Elegant Static Radial Glow - 0% CPU/GPU overhead, highly sophisticated */}
           <div className="absolute top-[-20%] left-[15%] w-[70%] h-[80%] rounded-full bg-gradient-to-br from-primary/10 via-accent/5 to-transparent blur-[130px] pointer-events-none" />
           <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3D%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
           
           {/* Interactive Glow Follower - High performance translation using direct CSS variables */}
           <div 
             className="absolute pointer-events-none w-[350px] h-[350px] bg-primary opacity-0 group-hover/hero:opacity-[0.05] rounded-full blur-[80px] transition-opacity duration-700 hidden md:block"
             style={{
               left: '0px',
               top: '0px',
               transform: 'translate3d(calc(var(--mouse-x, 0px) - 175px), calc(var(--mouse-y, 0px) - 175px), 0)',
               willChange: 'transform',
             }}
           />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Full-width Centered Hero Showcase Panel */}
          <div className="glass-strong rounded-[3rem] p-8 md:p-20 border border-surface-border/80 flex flex-col justify-between relative overflow-hidden group/main-card shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-emerald-400" />
            <div>
              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-5xl sm:text-7xl md:text-8xl font-black text-foreground tracking-tight leading-none mb-6"
              >
                Campus<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-600 to-teal-500">Market</span>
              </motion.h1>
              {/* Description */}
              <p className="text-foreground/70 text-sm md:text-lg font-medium mb-12 max-w-xl leading-relaxed">
                Fuel your student hustle. Buy & sell safely on campus.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full mt-4">
              {/* CTA Button */}
              <Link href="/deals" className="relative group px-8 py-4.5 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wider text-xs transition-all overflow-hidden inline-block hover:shadow-xl hover:shadow-primary/25 active:scale-95 text-center shrink-0">
                <span className="relative z-10">Start Digging Deals →</span>
                <motion.div 
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              </Link>
              {/* Search Bar inside Main Card */}
              <div className="flex-1">
                <GlobalSearch variant="hero" />
              </div>
            </div>
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

      {/* 3. SCROLLING CATEGORY MARQUEE (GoCart Inspired) */}
      <CategoriesMarquee />


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
           
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: "easeOut" }}
             >
               <Suspense fallback={<div className="h-[600px] w-full bg-surface rounded-[3rem] animate-pulse border border-surface-border" />}>
                 <SmartFeed />
               </Suspense>
             </motion.div>

            {isLoaded && !user && (
              <div className="mt-16 bg-surface/50 border border-surface-border rounded-[2.5rem] p-8 md:p-12 text-center shadow-xl max-w-3xl mx-auto relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-transparent to-transparent" />
                <div className="text-4xl mb-4">🔓</div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground mb-2">Want to see all products?</h3>
                <p className="text-foreground/60 text-xs md:text-sm mb-6 max-w-md mx-auto leading-relaxed font-medium">
                  You are currently viewing a limited selection of campus products. Sign in to view all listings, filter by category, and search the entire catalog.
                </p>
                <Link
                  href="/sign-in"
                  className="inline-block px-8 py-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg"
                >
                  Sign In to Access Marketplace →
                </Link>
              </div>
            )}
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

// Quick Category Pill (New)
function CategoryPill({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link href={href} className="snap-center shrink-0 first:pl-4 last:pr-4 md:first:pl-0 md:last:pr-0">
      <div className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-full border transition-all hover:scale-105 active:scale-95 ${active ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-surface hover:bg-white border-surface-border hover:shadow-xl hover:shadow-primary/5'}`}>
        <span className="text-lg md:text-xl filter drop-shadow-sm">{icon}</span>
        <span className={`font-black text-[10px] md:text-xs uppercase tracking-widest ${active ? 'text-primary-foreground' : 'text-foreground/70'}`}>{label}</span>
      </div>
    </Link>
  );
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

