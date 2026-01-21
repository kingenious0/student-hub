// src/components/marketplace/ProductCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZapIcon, MapPinIcon, PlusIcon } from '@/components/ui/Icons';
import { useCartStore } from '@/lib/store/cart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

// Custom Star Icon
const StarIcon = ({ className, fill }: { className?: string, fill?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

interface Product {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    category: { name: string; icon: string | null };
    vendor: { name: string; currentHotspot: string | null };
    hotspot: string | null;
    // New Fields
    averageRating?: number;
    totalReviews?: number;
    isInStock?: boolean;
    stockQuantity?: number;
    flashSale?: {
        salePrice: number;
        originalPrice: number;
        discountPercent: number;
        isActive: boolean;
    } | null;
}

export default function ProductCard({
    product,
    compact = false,
    badge,
    badgeColor
}: {
    product: Product;
    compact?: boolean;
    badge?: string;
    badgeColor?: string;
}) {
    const addToCart = useCartStore((state) => state.addToCart);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setIsAdmin(localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true');
    }, []);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(`Permanently delete ${product.title}?`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': 'omniadmin.com' }
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Delete failed', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Logic for price
        const finalPrice = product.flashSale?.isActive ? product.flashSale.salePrice : product.price;

        addToCart({
            id: product.id,
            title: product.title,
            price: finalPrice,
            imageUrl: product.imageUrl || '',
            vendorName: product.vendor.name || '',
            flashSaleId: product.flashSale?.isActive ? 'active' : undefined
        });

        // Optional: Toast or visual feedback
        toast.success("Added to cart", {
            description: `${product.title} is now in your cart.`,
        });
    };

    // Derived State
    const isOnSale = product.flashSale?.isActive;
    const currentPrice = isOnSale ? product.flashSale!.salePrice : product.price;
    const originalPrice = isOnSale ? product.flashSale!.originalPrice : null;
    const isOutOfStock = product.isInStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
    const rating = product.averageRating || 0;
    const reviewCount = product.totalReviews || 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all ${isDeleting ? 'opacity-50 grayscale' : ''} ${compact ? 'min-w-[160px] w-[160px]' : ''}`}
        >
            {/* Image Container - Aspect Square */}
            <div className="aspect-square relative flex items-center justify-center bg-muted overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="text-4xl opacity-20">
                        {product.category?.icon || '📦'}
                    </div>
                )}

                {/* Overlay: Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {/* Hotspot Badge */}
                    {product.hotspot && (
                        <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-md text-[10px] px-2 h-5 gap-1 border-0">
                            <MapPinIcon className="w-3 h-3 text-primary" />
                            {product.hotspot}
                        </Badge>
                    )}
                    {/* External Custom Badge (from SmartFeed) */}
                    {badge && (
                        <Badge className={`${badgeColor || 'bg-primary'} text-white text-[10px] px-2 h-5 border-0`}>
                            {badge}
                        </Badge>
                    )}
                </div>

                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 items-end">
                    {/* Sale Badge */}
                    {isOnSale && (
                        <Badge variant="destructive" className="text-[10px] px-2 h-5 animate-pulse">
                            SALE
                        </Badge>
                    )}
                    {/* Out of Stock Badge */}
                    {isOutOfStock && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-2 h-5">
                            OUT OF STOCK
                        </Badge>
                    )}
                </div>

                {/* Quick Add Button - Always Visible on Mobile, Hover on Desktop */}
                {!isAdmin && !isOutOfStock && (
                    <div className="absolute bottom-3 right-3 z-20">
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full shadow-xl bg-white text-black hover:bg-primary hover:text-white transition-all duration-300 border border-gray-100"
                            onClick={handleQuickAdd}
                        >
                            <PlusIcon className="w-6 h-6" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
                {/* Title & Vendor */}
                <div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                        <span className="truncate max-w-[100px]">{product.vendor.name}</span>
                        {product.category?.name && (
                            <>
                                <span>•</span>
                                <span>{product.category.name}</span>
                            </>
                        )}
                    </div>
                    <Link href={`/products/${product.id}`} className="block">
                        <h3 className="font-bold text-sm leading-tight line-clamp-2 hover:underline decoration-primary decoration-2 underline-offset-2 text-foreground">
                            {product.title}
                        </h3>
                    </Link>
                </div>

                {/* Rating */}
                {reviewCount > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="flex items-center text-yellow-400">
                            <StarIcon className="w-3 h-3" fill={rating >= 1} />
                            <StarIcon className="w-3 h-3" fill={rating >= 2} />
                            <StarIcon className="w-3 h-3" fill={rating >= 3} />
                            <StarIcon className="w-3 h-3" fill={rating >= 4} />
                            <StarIcon className="w-3 h-3" fill={rating >= 5} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">({reviewCount})</span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-black text-lg text-foreground">₵{currentPrice.toFixed(2)}</span>
                    {originalPrice && (
                        <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                            ₵{originalPrice.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>

            {/* Admin Overlay (Invisible to users) */}
            {isAdmin && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Quick Edit (Coming Soon)'); }}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        Del
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
