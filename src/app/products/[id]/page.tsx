'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { useCartStore } from '@/lib/store/cart';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const addToCart = useCartStore((state) => state.addToCart);

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('details');
    const [isGhostAdmin, setIsGhostAdmin] = useState(false);
    const [zoomImage, setZoomImage] = useState(false);

    useEffect(() => {
        fetchProduct();
        const ghost = localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true';
        if (ghost) setIsGhostAdmin(true);
    }, [params.id]);

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

    const handleAddToCart = () => {
        if (!product) return;

        // Use flash sale price if active
        const finalPrice = product.flashSale ? product.flashSale.salePrice : product.price;

        // Create product object for cart (normalized)
        const cartItem = {
            id: product.id,
            title: product.title,
            price: finalPrice,
            imageUrl: product.imageUrl,
            vendorId: product.vendor.id,
            vendorName: product.vendor.shopName || product.vendor.name,
            flashSaleId: product.flashSale?.id
        };

        addToCart(cartItem, quantity);

        // Show success feedback (TODO: Toast)
        router.push('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!product) return null; // Or 404 component

    const isOnSale = !!product.flashSale;
    const currentPrice = isOnSale ? product.flashSale.salePrice : product.price;
    const originalPrice = isOnSale ? product.flashSale.originalPrice : product.price;
    const discount = isOnSale ? product.flashSale.discountPercent : 0;

    return (
        <div className="min-h-screen bg-background pb-32 md:pb-12">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface-border">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 hover:bg-surface rounded-full transition-colors">
                        ← Back
                    </button>
                    <h1 className="font-bold truncate max-w-[200px] md:max-w-md opacity-0 md:opacity-100 transition-opacity">
                        {product.title}
                    </h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

                    {/* LEFT: Product Image */}
                    <div className="space-y-4">
                        <div
                            className="relative aspect-square rounded-3xl overflow-hidden bg-surface border border-surface-border cursor-zoom-in group"
                            onClick={() => setZoomImage(!zoomImage)}
                        >
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className={`w-full h-full object-cover transition-transform duration-500 ${zoomImage ? 'scale-150' : 'group-hover:scale-110'}`}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                            )}

                            {isOnSale && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-black uppercase text-sm shadow-xl animate-pulse">
                                    ⚡ Flash Sale • -{discount}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Product Details */}
                    <div>
                        <div className="mb-6">
                            <span className="text-primary font-bold text-sm uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                                {product.category?.name || 'General'}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black mt-4 mb-2 leading-tight">
                                {product.title}
                            </h1>

                            {/* Price Block */}
                            <div className="flex items-end gap-3 mt-6">
                                <span className="text-4xl md:text-6xl font-black text-primary">
                                    ₵{currentPrice.toFixed(2)}
                                </span>
                                {isOnSale && (
                                    <div className="flex flex-col mb-2">
                                        <span className="text-lg text-foreground/40 line-through font-bold">
                                            ₵{originalPrice.toFixed(2)}
                                        </span>
                                        <span className="text-xs font-bold text-red-500 uppercase">
                                            Save ₵{(originalPrice - currentPrice).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vendor Profile Card */}
                        <div className="bg-surface border border-surface-border rounded-2xl p-4 mb-8 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-lg">
                                {product.vendor.shopName?.[0] || product.vendor.name?.[0]}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold opacity-60 uppercase">Sold by</p>
                                <p className="font-black text-lg">{product.vendor.shopName || product.vendor.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold opacity-60">Location</p>
                                <p className="font-bold text-sm">📍 {product.hotspot || 'Campus'}</p>
                            </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="bg-surface/50 border border-surface-border rounded-3xl p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-bold text-lg">Quantity</span>
                                <div className="flex items-center gap-4 bg-background border border-surface-border rounded-xl p-1">
                                    <button
                                        onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-surface rounded-lg font-bold text-xl"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-black text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-surface rounded-lg font-bold text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isGhostAdmin}
                                className={`w-full py-4 text-xl font-black uppercase tracking-widest rounded-2xl shadow-lg transform transition-all active:scale-95 ${isGhostAdmin
                                    ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-[1.02]'
                                    }`}
                            >
                                {isGhostAdmin ? 'Admin Mode (No Buy)' : `Add to Cart • ₵${(currentPrice * quantity).toFixed(2)}`}
                            </button>
                        </div>

                        {/* Tabs: Details / Reviews */}
                        <div className="mt-8">
                            <div className="flex border-b border-surface-border mb-6">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-foreground/40'
                                        }`}
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-foreground/40'
                                        }`}
                                >
                                    Reviews ({product.reviews?.length || 0})
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'details' ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-foreground/80 leading-relaxed text-lg"
                                    >
                                        <div
                                            className="prose prose-invert max-w-none prose-p:text-foreground/80 prose-headings:text-foreground prose-strong:text-foreground"
                                            dangerouslySetInnerHTML={{ __html: product.description }}
                                        />

                                        <div className="grid grid-cols-2 gap-4 mt-8">
                                            <div className="bg-surface p-4 rounded-xl border border-surface-border">
                                                <p className="text-xs uppercase font-bold text-foreground/40 mb-1">Condition</p>
                                                <p className="font-bold">New</p>
                                            </div>
                                            <div className="bg-surface p-4 rounded-xl border border-surface-border">
                                                <p className="text-xs uppercase font-bold text-foreground/40 mb-1">Stock</p>
                                                <p className="font-bold text-green-500">In Stock</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="reviews"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        {product.reviews && product.reviews.length > 0 ? (
                                            product.reviews.map((review: any) => (
                                                <div key={review.id} className="bg-surface p-4 rounded-xl border border-surface-border">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold">{review.userName || 'Student'}</span>
                                                        <div className="flex text-yellow-500">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-foreground/80">{review.comment}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-foreground/40">
                                                <p className="font-bold">No reviews yet</p>
                                                <p className="text-sm">Be the first to review this product!</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
