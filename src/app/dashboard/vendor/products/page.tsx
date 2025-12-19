// src/app/dashboard/vendor/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string | null;
    hotspot: string | null;
    createdAt: string;
}

export default function VendorProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/products?vendorOnly=true');
            const data = await response.json();

            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            📦 My Products
                        </h1>
                        <p className="text-purple-200">
                            Manage your marketplace listings
                        </p>
                    </div>
                    <Link
                        href="/products/new"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                    >
                        ➕ Add Product
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                        <p className="mt-4 text-purple-200">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            No products yet
                        </h2>
                        <p className="text-purple-200 mb-6">
                            Start selling by adding your first product
                        </p>
                        <Link
                            href="/products/new"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                        >
                            Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all"
                            >
                                {/* Product Image */}
                                <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-6xl">📦</span>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-white">
                                            {product.title}
                                        </h3>
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                            {product.category}
                                        </span>
                                    </div>

                                    <p className="text-sm text-purple-200 mb-3 line-clamp-2">
                                        {product.description}
                                    </p>

                                    {product.hotspot && (
                                        <div className="flex items-center gap-2 mb-3 text-sm text-purple-300">
                                            <span>📍</span>
                                            <span>{product.hotspot}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-white">
                                            GH₵{product.price.toFixed(2)}
                                        </span>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors">
                                                Edit
                                            </button>
                                            <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-semibold transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
