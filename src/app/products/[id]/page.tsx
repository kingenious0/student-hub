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
    category: {
        name: string;
        icon: string | null;
    };
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
    const [isHybridAuth, setIsHybridAuth] = useState(false);

    useEffect(() => {
        fetchProduct();
        // Check if admin is viewing
        const ghost = localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true';
        if (ghost) setIsGhostAdmin(true);

        // Check for Native Session Sync manually (no external deps)
        const isVerified = document.cookie.split('; ').some(c => c.startsWith('OMNI_IDENTITY_VERIFIED=TRUE'));
        if (isVerified) {
            setIsHybridAuth(true);
        }
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
            {/* Simplified Header with Back Button */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-surface-border">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-surface hover:bg-surface-hover rounded-full flex items-center justify-center transition-colors"
                    >
                        <span className="text-lg">←</span>
                    </button>
                    <h1 className="text-lg font-bold truncate flex-1">{product.title}</h1>
                    <div className="text-xl font-black text-primary">₵{product.price.toFixed(2)}</div>
                </div>
            </div>

            {/* Product Image Section - Clean & Simple */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Image */}
                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface border border-surface-border">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-9xl">
                                📦
                            </div>
                        )}

                        {/* Vendor Status Badge */}
                        {product.vendor.isActive && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2 shadow-lg">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                Online Now
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-6">
                        {/* Title & Price */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 leading-tight">
                                {product.title}
                            </h1>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl md:text-5xl font-black text-primary">
                                    ₵{product.price.toFixed(2)}
                                </span>
                                <span className="text-sm font-bold text-foreground/40 uppercase">GHS</span>
                            </div>
                            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
                                {product.category?.name || 'General'}
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-2">
                            <div className="trust-badge">
                                🛡️ Escrow Protected
                            </div>
                            <div className="trust-badge">
                                ✓ Verified Vendor
                            </div>
                            <div className="trust-badge">
                                ⚡ Fast Delivery
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-surface border border-surface-border rounded-2xl p-6">
                            <h2 className="text-sm font-black text-foreground/40 uppercase tracking-widest mb-3">
                                Product Details
                            </h2>
                            <p className="text-foreground/80 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Vendor Info */}
                        <div className="bg-surface border border-surface-border rounded-2xl p-6">
                            <h3 className="text-sm font-black text-foreground/40 uppercase tracking-widest mb-4">
                                Sold By
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-lg font-black text-primary-foreground">
                                    {product.vendor.name?.[0] || 'V'}
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-foreground">
                                        {product.vendor.name || 'Anonymous Vendor'}
                                    </p>
                                    <p className="text-xs font-medium text-foreground/50">
                                        📍 {product.hotspot || 'Main Campus'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {(isHybridAuth || isGhostAdmin) ? (
                            <div>
                                {(product.vendor.clerkId === user?.id && !isGhostAdmin) ? (
                                    <button
                                        disabled
                                        className="w-full py-5 bg-surface border-2 border-surface-border text-foreground/40 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed"
                                    >
                                        You Own This Item
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-base uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                                    >
                                        🛒 Add to Cart • ₵{product.price.toFixed(2)}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <SignedIn>
                                    <div>
                                        {isGhostAdmin ? (
                                            <button
                                                disabled
                                                className="w-full py-5 bg-red-500/10 border-2 border-red-500/30 text-red-500 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed"
                                            >
                                                👁️ ADMIN MODE • BUYING DISABLED
                                            </button>
                                        ) : user?.id === product.vendor.clerkId ? (
                                            <button
                                                disabled
                                                className="w-full py-5 bg-surface border-2 border-surface-border text-foreground/40 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed"
                                            >
                                                You Own This Item
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleBuyNow}
                                                className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-base uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                                            >
                                                🛒 Add to Cart • ₵{product.price.toFixed(2)}
                                            </button>
                                        )}
                                    </div>
                                </SignedIn>

                                <SignedOut>
                                    <div className="bg-surface border border-surface-border rounded-2xl p-6 text-center">
                                        <h3 className="text-lg font-black text-foreground mb-3 uppercase">
                                            Sign In to Purchase
                                        </h3>
                                        <SignInButton mode="modal">
                                            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all">
                                                Sign In
                                            </button>
                                        </SignInButton>
                                    </div>
                                </SignedOut>
                            </>
                        )}
                    </div>
                </div>


                {/* Additional Info Section */}
                <div className="mt-12 bg-green-500/5 border border-green-500/20 rounded-3xl p-8">
                    <h3 className="text-lg font-black text-green-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        🛡️ Buyer Protection Guarantee
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <div className="text-3xl mb-2">💰</div>
                            <h4 className="font-bold text-foreground mb-1">Escrow Protection</h4>
                            <p className="text-sm text-foreground/60">Your money is held safely until you confirm delivery</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">✅</div>
                            <h4 className="font-bold text-foreground mb-1">Verified Handover</h4>
                            <p className="text-sm text-foreground/60">Secure pickup code system for safe exchanges</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">↩️</div>
                            <h4 className="font-bold text-foreground mb-1">Full Refund</h4>
                            <p className="text-sm text-foreground/60">100% money-back if something goes wrong</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button (Mobile) */}
            {(isHybridAuth || isGhostAdmin || (user && user.id !== product.vendor.clerkId)) && (
                <button
                    onClick={handleBuyNow}
                    className={`fixed bottom-6 right-6 w-16 h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all md:hidden ${showFAB ? 'scale-100' : 'scale-0'}`}
                >
                    🛒
                </button>
            )}
        </div >
    );
}
