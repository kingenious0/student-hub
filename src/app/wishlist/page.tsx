'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';
import { HeartIcon, XIcon } from '@/components/ui/Icons';
import EnhancedProductCard from '@/components/marketplace/EnhancedProductCard';

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

    const addToCart = useCartStore((s) => s.addToCart);

    const handleRemove = async (productId: string) => {
        await removeItem(productId);
        setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
        toast.success('Removed from wishlist');
    };

    const handleAddToCart = useCallback((product: any) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const isOnSale = !!product.flashSale?.isActive;
        addToCart({
            id: product.id,
            title: product.title,
            price: isOnSale ? product.flashSale!.salePrice : product.price,
            imageUrl: product.imageUrl,
            vendor: product.vendor,
        });
    }, [addToCart]);

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

                            return (
                                <div
                                    key={item.id}
                                    className="group relative"
                                >
                                    <EnhancedProductCard
                                        id={product.id}
                                        title={product.title}
                                        price={isOnSale ? product.flashSale!.salePrice : product.price}
                                        imageUrl={product.imageUrl}
                                        category={product.category?.name}
                                        vendorName={product.vendor.shopName || product.vendor.name || 'Vendor'}
                                        stockQuantity={product.stockQuantity}
                                        averageRating={product.averageRating || undefined}
                                        totalReviews={product.totalReviews}
                                        isFlashSale={isOnSale}
                                        originalPrice={isOnSale ? product.flashSale!.originalPrice : undefined}
                                        discountPercent={isOnSale ? product.flashSale!.discountPercent : undefined}
                                        categoryIcon="❤️"
                                        showShield={true}
                                        onAddToCart={handleAddToCart(product)}
                                    />

                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        aria-label="Remove from wishlist"
                                        className="absolute top-2 right-2 z-20 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                    >
                                        <XIcon className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
