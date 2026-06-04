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
  hotspot,
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-black uppercase">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick-Add Button */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart?.(e);
            }}
            className="absolute bottom-2 right-2 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all z-30 md:translate-y-12 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 duration-300"
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
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4 flex flex-col flex-1 gap-1.5 relative z-10">
        {/* Category */}
        {category && (
          <div className="text-[9px] md:text-[10px] font-black text-foreground/40 uppercase tracking-wider">
            {category}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm md:text-base font-black text-foreground leading-tight line-clamp-2 min-h-[2.5em] uppercase tracking-tight">
          {title}
        </h3>

        {/* Vendor Trust */}
        {vendorName && (
          <div className="text-[9px] md:text-[10px] text-foreground/40 font-bold uppercase tracking-wider truncate">
            ✓ {vendorName}
          </div>
        )}

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
            <span className="text-[9px] font-bold text-foreground/60">
              ({totalReviews})
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div className="flex items-end gap-2">
            <div>
              <div
                className="text-[9px] font-black uppercase tracking-wider mb-0.5"
                style={{ color: themeColor }}
              >
                Price
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-black text-foreground leading-none tracking-tighter">
                  ₵{price.toFixed(2)}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-sm font-medium text-foreground/40 line-through">
                    ₵{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Shield Badge */}
          {showShield && (
            <div className="text-2xl md:text-3xl relative mb-0.5" title="Shield Escrow Protected">
              <span className="filter drop-shadow-[0_2px_4px_rgba(57,255,20,0.3)]">🛡️</span>
              <div
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: themeColor,
                  boxShadow: `0 0 8px ${themeColor}99`,
                }}
              />
            </div>
          )}
        </div>

        {/* Stock Status */}
        {!isOutOfStock && !isLowStock && stockQuantity > 5 && (
          <div className="text-[9px] font-bold flex items-center gap-1" style={{ color: themeColor }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
            In Stock
          </div>
        )}

        {/* Delivery Info */}
        {hotspot && (
          <div className="mt-1 pt-2 border-t border-surface-border text-[9px] font-bold text-foreground/40 uppercase tracking-wider flex items-center gap-1">
            <span>⚡ {deliveryTime} to</span>
            <span className="truncate max-w-[80px]">{hotspot}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
