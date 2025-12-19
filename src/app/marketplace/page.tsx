// src/app/marketplace/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string | null;
    hotspot: string | null;
    vendor: {
        id: string;
        name: string | null;
        isActive: boolean;
        currentHotspot: string | null;
    };
}

export default function MarketplacePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHotspot, setSelectedHotspot] = useState('');

    const hotspots = [
        'Balme Library',
        'Night Market',
        'Pent Hostel',
        'Bush Canteen',
        'Great Hall',
        'Casford',
        'Lecture Hall',
        'Cafeteria',
    ];

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, selectedHotspot]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (selectedHotspot) params.append('hotspot', selectedHotspot);

            const response = await fetch(`/api/search/flash-match?${params}`);
            const data = await response.json();

            if (data.success) {
                setProducts(data.results);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = async (productId: string) => {
        try {
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 }),
            });

            const data = await response.json();

            if (data.success) {
                alert(`Order created! Payment request code: ${data.payment.request_code}`);
                // In production, redirect to Paystack payment page
            } else {
                alert(`Order failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Order creation failed:', error);
            alert('Failed to create order');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🔥 Student Marketplace
                    </h1>
                    <p className="text-purple-200">
                        Flash-Match: Find what you need from nearby vendors
                    </p>
                </div>

                <SignedOut>
                    <div className="bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Sign in to start shopping
                        </h2>
                        <SignInButton mode="modal">
                            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
                                Sign In
                            </button>
                        </SignInButton>
                    </div>
                </SignedOut>

                <SignedIn>
                    {/* Search & Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Search for food, books, lessons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <select
                                value={selectedHotspot}
                                onChange={(e) => setSelectedHotspot(e.target.value)}
                                className="px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Locations</option>
                                {hotspots.map((hotspot) => (
                                    <option key={hotspot} value={hotspot}>
                                        📍 {hotspot}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                            <p className="mt-4 text-purple-200">Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                            <p className="text-xl text-purple-200">
                                No products found. Try a different search or location.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:scale-105"
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
                                            {product.vendor.isActive && (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                                                    🟢 Online
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-purple-200 mb-3 line-clamp-2">
                                            {product.description}
                                        </p>

                                        <div className="flex items-center gap-2 mb-3 text-sm text-purple-300">
                                            <span>📍</span>
                                            <span>{product.hotspot || 'Location not set'}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-white">
                                                GH₵{product.price.toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => handleOrder(product.id)}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                                            >
                                                Order Now
                                            </button>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <p className="text-xs text-purple-300">
                                                Vendor: {product.vendor.name || 'Anonymous'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SignedIn>
            </div>
        </div>
    );
}
