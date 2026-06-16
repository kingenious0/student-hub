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
import { Hero2 } from "@/components/ui/hero-2-1";



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

      {/* 1. PREMIUM DYNAMIC HERO */}
      <Hero2 />

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

