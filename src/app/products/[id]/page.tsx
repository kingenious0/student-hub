'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string | null;
    hotspot: string | null;
    vendor: {
        id: string;
        name: string | null;
        clerkId: string;
        isActive: boolean;
        currentHotspot: string | null;
    };
}

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFAB, setShowFAB] = useState(false);
    const [isGhostAdmin, setIsGhostAdmin] = useState(false);

    useEffect(() => {
        fetchProduct();
        // Check if admin is viewing
        const ghost = localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true';
        if (ghost) setIsGhostAdmin(true);
    }, [params.id]);

    useEffect(() => {
        const handleScroll = () => {
            setShowFAB(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setProduct(data.product);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = () => {
        // Block buying if admin is viewing
        if (isGhostAdmin) {
            alert('🛡️ ADMIN MODE ACTIVE\n\nBuying is disabled in Ghost Admin mode.\n\nTo purchase, please sign out of admin mode.');
            return;
        }
        if (product) {
            addToCart(product);
            router.push('/cart');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin omni-glow"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-black text-foreground/50 uppercase">Product Not Found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Immersive Media Section - 60% of screen */}
            <div className="relative h-[60vh] md:h-[65vh] overflow-hidden">
                {/* Product Image */}
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface to-background flex items-center justify-center text-9xl">
                        📦
                    </div>
                )}

                {/* Glass Overlay for Title & Price */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 glass-strong border-t border-surface-border">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-3 uppercase tracking-tighter drop-shadow-lg">
                            {product.title}
                        </h1>
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl md:text-6xl font-black text-primary tracking-tighter drop-shadow-lg">
                                ₵{product.price.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-white/60 uppercase tracking-widest">GHS</span>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-28 left-6 w-12 h-12 glass-strong rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform z-20"
                >
                    ←
                </button>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Trust Badge Row */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <div className="trust-badge">
                        🛡️ Shield Escrow Protected
                    </div>
                    <div className="trust-badge">
                        ✓ Verified Student Vendor
                    </div>
                    <div className="trust-badge">
                        ⚡ Flash-Match Ready
                    </div>
                    {product.vendor.isActive && (
                        <div className="trust-badge bg-green-500/10 border-green-500/30">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online Now
                        </div>
                    )}
                </div>

                {/* Product Details Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Description */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bento-card">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-4">
                                Product Details
                            </h2>
                            <p className="text-foreground/60 text-lg leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Vendor Info */}
                        <div className="bento-card">
                            <h3 className="text-sm font-black text-foreground/40 uppercase tracking-widest mb-4">
                                Vendor Information
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-black text-primary-foreground">
                                    {product.vendor.name?.[0] || 'V'}
                                </div>
                                <div>
                                    <p className="text-xl font-black text-foreground uppercase tracking-tight">
                                        {product.vendor.name || 'Anonymous Vendor'}
                                    </p>
                                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                                        📍 {product.hotspot || 'Main Campus'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bento-card bg-gradient-to-br from-primary/5 to-transparent">
                            <h3 className="text-sm font-black text-foreground/40 uppercase tracking-widest mb-4">
                                Category
                            </h3>
                            <p className="text-lg font-black text-primary uppercase tracking-tight">
                                {product.category}
                            </p>
                        </div>

                        <div className="bento-card bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20">
                            <h3 className="text-sm font-black text-green-500 uppercase tracking-widest mb-3">
                                🛡️ Buyer Protection
                            </h3>
                            <ul className="space-y-2 text-sm text-foreground/60">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Funds held in escrow until delivery</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Secure handover verification</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>Full refund protection</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>


                {/* Desktop Buy Button */}
                <SignedIn>
                    <div className="hidden md:block">
                        {isGhostAdmin ? (
                            <button
                                disabled
                                className="w-full py-6 bg-red-500/10 border-2 border-red-500/30 text-red-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] cursor-not-allowed"
                            >
                                👁️ ADMIN MODE • BUYING DISABLED
                            </button>
                        ) : user?.id === product.vendor.clerkId ? (
                            <button
                                disabled
                                className="w-full py-6 bg-surface border border-surface-border text-foreground/40 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] cursor-not-allowed"
                            >
                                You Own This Item
                            </button>
                        ) : (
                            <button
                                onClick={handleBuyNow}
                                className="w-full py-6 bg-primary hover:brightness-110 text-primary-foreground rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 omni-glow-strong"
                            >
                                Buy Now - ₵{product.price.toFixed(2)}
                            </button>
                        )}
                    </div>
                </SignedIn>

                <SignedOut>
                    <div className="bento-card text-center">
                        <h3 className="text-xl font-black text-foreground mb-4 uppercase">
                            Sign In to Purchase
                        </h3>
                        <SignInButton mode="modal">
                            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all">
                                Sign In
                            </button>
                        </SignInButton>
                    </div>
                </SignedOut>
            </div>

            {/* Floating Action Button (Mobile) */}
            <SignedIn>
                {!isGhostAdmin && user?.id !== product.vendor.clerkId && (
                    <button
                        onClick={handleBuyNow}
                        className={`fab md:hidden ${showFAB ? 'scale-100' : 'scale-0'} transition-transform duration-300`}
                        style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }}
                    >
                        🛒
                    </button>
                )}
            </SignedIn>
        </div >
    );
}
