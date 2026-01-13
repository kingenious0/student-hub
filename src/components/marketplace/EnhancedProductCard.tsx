// Enhanced Product Card Component with Jumia-style features
'use client';

import Link from 'next/link';
import { useState } from 'react';

interface EnhancedProductCardProps {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    category?: string;
    vendorName?: string;
    stockQuantity?: number;
    averageRating?: number;
    totalReviews?: number;
    isFlashSale?: boolean;
    originalPrice?: number;
    discountPercent?: number;
}

export default function EnhancedProductCard({
    id,
    title,
    price,
    imageUrl,
    category,
    vendorName,
    stockQuantity = 100,
    averageRating,
    totalReviews,
    isFlashSale = false,
    originalPrice,
    discountPercent,
}: EnhancedProductCardProps) {
    const [imageError, setImageError] = useState(false);
    const isLowStock = stockQuantity > 0 && stockQuantity <= 5;
    const isOutOfStock = stockQuantity === 0;

    return (
        <Link
            href={`/products/${id}`}
            className="group relative bg-surface border border-surface-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-surface-hover overflow-hidden">
                {imageUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                    </div>
                )}

                {/* Flash Sale Badge */}
                {isFlashSale && discountPercent && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg">
                        -{discountPercent}%
                    </div>
                )}

                {/* Stock Indicator */}
                {isLowStock && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        Only {stockQuantity} left!
                    </div>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-black uppercase">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
                {/* Category */}
                {category && (
                    <div className="text-xs font-bold text-primary uppercase tracking-wide">
                        {category}
                    </div>
                )}

                {/* Title */}
                <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>

                {/* Rating */}
                {averageRating && totalReviews && totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-sm ${i < Math.floor(averageRating)
                                            ? 'text-yellow-500'
                                            : 'text-gray-300'
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="text-xs text-foreground/60">
                            ({totalReviews})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">
                        ₵{price.toFixed(2)}
                    </span>
                    {originalPrice && originalPrice > price && (
                        <span className="text-sm font-medium text-foreground/40 line-through">
                            ₵{originalPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Vendor */}
                {vendorName && (
                    <div className="text-xs text-foreground/50 font-medium">
                        by {vendorName}
                    </div>
                )}

                {/* In Stock Badge */}
                {!isOutOfStock && !isLowStock && (
                    <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        In Stock
                    </div>
                )}
            </div>
        </Link>
    );
}
