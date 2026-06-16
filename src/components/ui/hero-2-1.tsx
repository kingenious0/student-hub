"use client";

import { useState } from "react";
import { ArrowRight, Menu, X, Shield, ShoppingBag, Landmark, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const Hero2 = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex flex-col justify-center">
      {/* Gradient background with grain effect */}
      <div className="flex flex-col items-end absolute -right-60 -top-10 blur-xl z-0 pointer-events-none">
        <div className="h-[15rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[8rem] from-primary/40 to-emerald-600/30"></div>
        <div className="h-[15rem] rounded-full w-[90rem] z-1 bg-gradient-to-b blur-[8rem] from-emerald-950/40 to-teal-400/30"></div>
        <div className="h-[15rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[8rem] from-teal-600/30 to-primary/40"></div>
      </div>
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3D%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] opacity-15 pointer-events-none"></div>

      {/* Content container */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between px-6 py-6 mt-2">
          <Link href="/" className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-black shadow-lg shadow-primary/20">
              <span className="font-black text-lg">H</span>
            </div>
            <span className="ml-3 text-2xl font-black text-white uppercase tracking-wider italic">LaHustle<span className="text-primary font-black">.</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Link href="/marketplace" className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Marketplace</Link>
              <Link href="/deals" className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Deals</Link>
              <Link href="/stories" className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Pulse Feed</Link>
              <Link href="/become-vendor" className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Start Selling</Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href="/marketplace" className="h-12 flex items-center justify-center rounded-2xl bg-primary px-8 text-xs font-black uppercase tracking-widest text-black hover:bg-primary/95 transition-all shadow-md">
                  Go to Marketplace
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="text-xs font-black uppercase tracking-widest text-white hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link href="/sign-up" className="h-12 flex items-center justify-center rounded-2xl bg-primary px-8 text-xs font-black uppercase tracking-widest text-black hover:bg-primary/95 transition-all shadow-md">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white hover:text-primary transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Menu with animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex flex-col p-6 bg-black/95 md:hidden"
            >
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-black">
                    <span className="font-black text-lg">H</span>
                  </div>
                  <span className="ml-3 text-2xl font-black text-white uppercase tracking-wider italic">LaHustle<span className="text-primary font-black">.</span></span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white hover:text-primary transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-12 flex flex-col space-y-6">
                <MobileLink href="/marketplace" label="Marketplace" setOpen={setMobileMenuOpen} />
                <MobileLink href="/deals" label="Deals" setOpen={setMobileMenuOpen} />
                <MobileLink href="/stories" label="Pulse Feed" setOpen={setMobileMenuOpen} />
                <MobileLink href="/become-vendor" label="Start Selling" setOpen={setMobileMenuOpen} />
                
                <div className="pt-8 flex flex-col gap-4">
                  {user ? (
                    <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="h-12 flex items-center justify-center rounded-2xl bg-primary text-xs font-black uppercase tracking-widest text-black text-center">
                      Go to Marketplace
                    </Link>
                  ) : (
                    <>
                      <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="h-12 flex items-center justify-center rounded-2xl border border-gray-800 text-xs font-black uppercase tracking-widest text-white text-center hover:bg-white/5 transition-colors">
                        Log in
                      </Link>
                      <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className="h-12 flex items-center justify-center rounded-2xl bg-primary text-xs font-black uppercase tracking-widest text-black text-center">
                        Create Free Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-12 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/5 border border-white/10 px-5 py-2 backdrop-blur-md hover:border-primary/30 transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">
            Ghana's #1 Campus Marketplace & Escrow Platform
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
        </motion.div>

        {/* Hero section */}
        <div className="container mx-auto mt-8 px-6 text-center max-w-5xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mx-auto text-5xl font-black leading-tight text-white md:text-7xl lg:text-8xl tracking-tight uppercase"
          >
            Power Your <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-teal-400">Campus Hustle</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mx-auto mt-6 max-w-2xl text-sm md:text-base text-gray-400 uppercase font-black tracking-wider leading-relaxed"
          >
            Trade goods, order food, and request campus services with absolute trust. 
            Secured by our student-to-student smart escrow system.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
          >
            <Link href="/marketplace" className="h-14 flex items-center justify-center rounded-2xl bg-primary px-8 text-xs font-black uppercase tracking-widest text-black hover:bg-primary/95 transition-all shadow-xl shadow-primary/10 active:scale-95">
              Explore Marketplace
            </Link>
            <Link href="/become-vendor" className="h-14 flex items-center justify-center rounded-2xl border border-gray-800 bg-white/5 px-8 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-gray-700 transition-all active:scale-95">
              Become a Vendor
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20 mb-10"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left group hover:border-primary/20 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Escrow Protected</h3>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">Funds are securely held until you verify and receive your goods or services.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left group hover:border-primary/20 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Instant Shops</h3>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">Set up your store in 60 seconds. List products, set delivery hotspots, and track orders.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left group hover:border-primary/20 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Campus Hustle</h3>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">Offer skill exchanges, freelance gigs, design services, or run delivery services.</p>
            </div>
          </motion.div>

          {/* Hero Image / Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="relative mx-auto mt-16 mb-20 w-full max-w-4xl"
          >
            <div className="absolute inset-0 rounded-[2.5rem] shadow-lg bg-primary/20 blur-[8rem] pointer-events-none" />
            <div className="relative border-4 border-white/10 rounded-[2.5rem] overflow-hidden bg-zinc-950 p-2 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1600&auto=format&fit=crop"
                alt="LaHustle Platform UI Dashboard Preview"
                className="w-full h-auto rounded-[2rem] border border-white/5 shadow-inner"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

function MobileLink({ href, label, setOpen }: { href: string; label: string; setOpen: (val: boolean) => void }) {
  return (
    <Link 
      href={href} 
      onClick={() => setOpen(false)} 
      className="flex items-center justify-between border-b border-gray-900 pb-3 text-lg font-black uppercase tracking-widest text-white hover:text-primary transition-colors"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-primary" />
    </Link>
  );
}

export { Hero2 };
