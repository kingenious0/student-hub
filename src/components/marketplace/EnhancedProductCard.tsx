'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  hotspot?: string | null;
  deliveryTime?: string;
  themeColor?: string;
  categoryIcon?: string;
  isStudentDeal?: boolean;
  showShield?: boolean;
  onAddToCart?: (e: React.MouseEvent) => void;
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
  deliveryTime = '15m',
  themeColor = '#10B981',
  categoryIcon = '📦',
  isStudentDeal = false,
  showShield = true,
  onAddToCart,
}: EnhancedProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;
  const isOutOfStock = stockQuantity === 0;

  return (
    <Link
      href={`/products/${id}`}
      className="group relative bg-surface border border-surface-border/60 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col"
      style={{
        ['--card-theme' as string]: themeColor,
      }}
    >
      {/* Theme Gradient Overlay on Hover */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[var(--card-theme)]/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none transition-opacity duration-300 z-[1]"
      />

      {/* Image Container */}
      <div className="relative aspect-square bg-surface-hover overflow-hidden">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
            {categoryIcon}
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Student Deal Badge */}
        {isStudentDeal && (
          <div
            className="absolute top-2 right-2 z-20 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            Student Deal
          </div>
        )}

        {/* Flash Sale Badge */}
        {isFlashSale && discountPercent && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg z-20">
            -{discountPercent}%
          </div>
        )}

        {/* Low Stock Indicator */}
        {isLowStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse z-20">
            Only {stockQuantity} left!
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-slate-700/90 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Quick-Add Button (Outside image container to prevent clipping) */}
      {!isOutOfStock && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart?.(e);
          }}
          className="absolute right-4 top-[calc(100%/1.88)] md:top-[calc(100%/1.84)] -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-30"
          style={{
            backgroundColor: themeColor,
            color: '#000',
            boxShadow: `0 4px 14px ${themeColor}66`,
          }}
          title="Quick Add to Cart"
        >
          <span className="text-xl md:text-2xl font-black leading-none pb-0.5">+</span>
        </button>
      )}

      {/* Product Info */}
      <div className="p-3.5 md:p-4.5 flex flex-col flex-1 gap-1.5 relative z-10">
        {/* Category */}
        {category && (
          <div className="text-[9px] md:text-[10px] font-black text-foreground/40 uppercase tracking-widest">
            {category}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm md:text-base font-black text-foreground leading-tight line-clamp-2 min-h-[2.5em] uppercase tracking-tight">
          {title}
        </h3>

        {/* Vendor Trust */}
        {vendorName && (
          <div className="text-[9px] md:text-[10px] text-foreground/45 font-bold uppercase tracking-wider truncate">
            ✓ {vendorName}
          </div>
        )}

        {/* Rating */}
        {averageRating && totalReviews && totalReviews > 0 ? (
          <div className="flex items-center gap-1.5">
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
            <span className="text-[9px] font-bold text-foreground/60">
              ({totalReviews})
            </span>
          </div>
        ) : (
          /* Placeholder to maintain height alignment */
          <div className="h-[20px]" />
        )}

        {/* Price Section */}
        <div className="mt-auto pt-3.5 flex items-end justify-between border-t border-dashed border-surface-border/50">
          <div>
            <div
              className="text-[9px] font-black uppercase tracking-widest mb-1"
              style={{ color: themeColor }}
            >
              Price
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-black text-foreground leading-none tracking-tighter">
                ₵{price.toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs font-semibold text-foreground/40 line-through">
                  ₵{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          {/* Shield Badge (Custom light-green circle shield from screenshot) */}
          {showShield && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.15)] shrink-0" title="Shield Escrow Protected">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          )}
        </div>

        {/* Stock Status */}
        {!isOutOfStock && !isLowStock && stockQuantity > 5 && (
          <div className="text-[9px] font-bold flex items-center gap-1.5 mt-2" style={{ color: themeColor }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
            In Stock
          </div>
        )}
      </div>
    </Link>
  );
}
