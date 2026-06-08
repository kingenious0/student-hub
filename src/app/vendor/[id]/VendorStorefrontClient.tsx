'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface VendorData {
    id: string;
    name: string | null;
    shopName: string | null;
    shopLandmark: string | null;
    phoneNumber: string | null;
    vendorType: string | null;
    isAcceptingOrders: boolean;
    currentHotspot: string | null;
}

interface ProductData {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string | null;
    category: { id: string; name: string; icon: string | null } | null;
    stockQuantity: number;
    hotspot: string | null;
    averageRating: number | null;
    totalReviews: number;
    isFlashSale: boolean;
    salePrice?: number;
    discountPercent?: number;
}

export default function VendorStorefrontClient({
    vendorData,
}: {
    vendorData: VendorData;
}) {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/vendor/${vendorData.id}/public`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.products);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [vendorData.id]);

    const displayName = vendorData.shopName || vendorData.name || 'Vendor Store';
    const storeUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative pt-28 pb-16 md:pb-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-2xl font-black text-primary-foreground shadow-lg">
                                    {displayName[0]?.toUpperCase() || 'S'}
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter">
                                        {displayName}
                                    </h1>
                                    {vendorData.shopLandmark && (
                                        <p className="text-foreground/50 font-bold text-sm uppercase tracking-wider mt-1">
                                            📍 {vendorData.shopLandmark}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                {vendorData.currentHotspot && (
                                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
                                        📍 {vendorData.currentHotspot}
                                    </span>
                                )}
                                {vendorData.vendorType && (
                                    <span className="px-3 py-1.5 bg-foreground/5 text-foreground/60 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        {vendorData.vendorType === 'FOOD' ? '🍔 Food' : vendorData.vendorType === 'GOODS' ? '📦 Goods' : '🔄 Mixed'}
                                    </span>
                                )}
                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${vendorData.isAcceptingOrders ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {vendorData.isAcceptingOrders ? '🟢 Accepting Orders' : '🔴 Currently Closed'}
                                </span>
                            </div>

                            {vendorData.phoneNumber && (
                                <a
                                    href={`tel:${vendorData.phoneNumber}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-surface-border rounded-xl text-foreground/60 hover:text-primary hover:border-primary/30 transition-all text-sm font-bold"
                                >
                                    📞 {vendorData.phoneNumber}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                        {vendorData.vendorType === 'FOOD' ? 'Menu' : 'Products'}
                        <span className="text-foreground/30 ml-2">({products.length})</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-surface border border-surface-border/60 rounded-2xl overflow-hidden animate-pulse">
                                <div className="aspect-square bg-surface-hover" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-surface-hover rounded w-1/3" />
                                    <div className="h-4 bg-surface-hover rounded w-2/3" />
                                    <div className="h-6 bg-surface-hover rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4 opacity-20">📦</div>
                        <p className="text-foreground/40 font-black uppercase tracking-wider">No products available yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map(product => (
                            <VendorProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-surface-border py-8">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">
                        Powered by OMNI Student Marketplace
                    </p>
                </div>
            </div>
        </div>
    );
}

function VendorProductCard({ product }: { product: ProductData }) {
    const [imageError, setImageError] = useState(false);

    const effectivePrice = product.isFlashSale && product.salePrice ? product.salePrice : product.price;

    return (
        <Link
            href={`/products/${product.id}`}
            className="group relative bg-surface border border-surface-border/60 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col"
        >
            <div className="relative aspect-square bg-surface-hover overflow-hidden">
                {product.imageUrl && !imageError ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
                        {product.category?.icon || '📦'}
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {product.isFlashSale && product.discountPercent && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-lg z-10">
                        -{product.discountPercent}%
                    </div>
                )}
            </div>

            <div className="p-3 md:p-4 flex flex-col flex-1 gap-1 relative z-10">
                {product.category && (
                    <div className="text-[9px] font-black text-foreground/40 uppercase tracking-wider">
                        {product.category.name}
                    </div>
                )}

                <h3 className="text-sm md:text-base font-black text-foreground leading-tight line-clamp-2 min-h-[2.5em] uppercase tracking-tight">
                    {product.title}
                </h3>

                {product.averageRating && product.totalReviews > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < Math.floor(product.averageRating!) ? 'text-yellow-500' : 'text-gray-300'}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="text-[9px] font-bold text-foreground/60">
                            ({product.totalReviews})
                        </span>
                    </div>
                )}

                <div className="mt-auto pt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl md:text-2xl font-black text-foreground leading-none tracking-tighter">
                            ₵{effectivePrice.toFixed(2)}
                        </span>
                        {product.isFlashSale && product.price !== effectivePrice && (
                            <span className="text-sm font-medium text-foreground/40 line-through">
                                ₵{product.price.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
