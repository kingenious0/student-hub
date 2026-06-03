'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useWishlistStore } from '@/lib/store/wishlist';
import { toast } from 'sonner';
import { HeartIcon, XIcon } from '@/components/ui/Icons';

interface WishlistProduct {
    id: string;
    productId: string;
    createdAt: string;
    product: {
        id: string;
        title: string;
        price: number;
        imageUrl: string | null;
        isInStock: boolean;
        stockQuantity: number;
        averageRating: number | null;
        totalReviews: number;
        vendor: {
            id: string;
            name: string;
            shopName: string | null;
        };
        category: { name: string } | null;
        flashSale: {
            salePrice: number;
            originalPrice: number;
            discountPercent: number;
            isActive: boolean;
        } | null;
    };
}

export default function WishlistPage() {
    const { user, isLoaded } = useUser();
    const { items: localIds, removeItem } = useWishlistStore();
    const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && user) {
            fetch('/api/wishlist')
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setWishlistItems(data.items);
                        useWishlistStore.getState().setItems(data.items.map((i: any) => i.productId));
                    }
                })
                .catch(() => { })
                .finally(() => setLoading(false));
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [isLoaded, user]);

    const handleRemove = async (productId: string) => {
        await removeItem(productId);
        setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
        toast.success('Removed from wishlist');
    };

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">
                        Your Wishlist
                    </h1>
                    <p className="text-foreground/60">
                        {loading ? 'Loading...' : `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved`}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : !user ? (
                    <div className="text-center py-24">
                        <div className="text-6xl mb-6">🔒</div>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Sign in to view your wishlist</h2>
                        <p className="text-foreground/60 mb-8">Save items you love and come back to them later.</p>
                        <Link
                            href="/sign-in"
                            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                        >
                            Sign In
                        </Link>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-6xl mb-6">💔</div>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Empty Wishlist</h2>
                        <p className="text-foreground/60 mb-8">You haven't saved any items yet. Start browsing the marketplace!</p>
                        <Link
                            href="/marketplace"
                            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => {
                            const product = item.product;
                            const isOnSale = !!product.flashSale?.isActive;
                            const currentPrice = isOnSale ? product.flashSale!.salePrice : product.price;
                            const originalPrice = isOnSale ? product.flashSale!.originalPrice : null;

                            return (
                                <div
                                    key={item.id}
                                    className="group relative bg-surface border border-surface-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    <Link href={`/products/${product.id}`}>
                                        <div className="relative aspect-square bg-surface-hover overflow-hidden">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                                    📦
                                                </div>
                                            )}
                                            {isOnSale && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg">
                                                    -{product.flashSale!.discountPercent}%
                                                </div>
                                            )}
                                            {!product.isInStock && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                    <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-black uppercase">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        aria-label="Remove from wishlist"
                                        className="absolute top-3 right-3 z-10 w-11 h-11 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                    >
                                        <XIcon className="w-4 h-4 text-white" />
                                    </button>

                                    <div className="p-4 space-y-2">
                                        {product.category && (
                                            <div className="text-xs font-bold text-primary uppercase tracking-wide">
                                                {product.category.name}
                                            </div>
                                        )}

                                        <Link href={`/products/${product.id}`}>
                                            <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                                {product.title}
                                            </h3>
                                        </Link>

                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-primary">
                                                ₵{currentPrice.toFixed(2)}
                                            </span>
                                            {originalPrice && (
                                                <span className="text-sm font-medium text-foreground/40 line-through">
                                                    ₵{originalPrice.toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs text-foreground/50 font-medium">
                                            by {product.vendor.shopName || product.vendor.name}
                                        </div>

                                        {product.isInStock ? (
                                            <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                In Stock
                                            </div>
                                        ) : (
                                            <div className="text-xs text-red-500 font-bold flex items-center gap-1">
                                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
