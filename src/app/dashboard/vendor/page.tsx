// src/app/dashboard/vendor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface Order {
    id: string;
    status: string;
    escrowStatus: string;
    amount: number;
    createdAt: string;
    product: {
        title: string;
    };
    student: {
        name: string | null;
    };
}

export default function VendorDashboard() {
    const { user } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        heldInEscrow: 0,
        totalProducts: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch products count
            const productsRes = await fetch('/api/products?vendorOnly=true');
            const productsData = await productsRes.json();

            if (productsData.success) {
                setStats(prev => ({
                    ...prev,
                    totalProducts: productsData.products.length,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        📊 Vendor Dashboard
                    </h1>
                    <p className="text-purple-200">
                        Welcome back, {user?.firstName || 'Vendor'}!
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                        <div className="text-purple-300 text-sm mb-2">Total Orders</div>
                        <div className="text-3xl font-bold text-white">{stats.totalOrders}</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                        <div className="text-purple-300 text-sm mb-2">Pending Orders</div>
                        <div className="text-3xl font-bold text-yellow-400">{stats.pendingOrders}</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                        <div className="text-purple-300 text-sm mb-2">Completed</div>
                        <div className="text-3xl font-bold text-green-400">{stats.completedOrders}</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                        <div className="text-purple-300 text-sm mb-2">Total Revenue</div>
                        <div className="text-3xl font-bold text-white">
                            GH₵{stats.totalRevenue.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                        <div className="text-purple-300 text-sm mb-2">Products Listed</div>
                        <div className="text-3xl font-bold text-purple-400">{stats.totalProducts}</div>
                    </div>
                </div>

                {/* Escrow Alert */}
                {stats.heldInEscrow > 0 && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🔒</span>
                            <div>
                                <h3 className="text-xl font-bold text-yellow-300 mb-1">
                                    Funds in Escrow
                                </h3>
                                <p className="text-yellow-200">
                                    GH₵{stats.heldInEscrow.toFixed(2)} held in escrow. Will be released when students scan QR codes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/products/new"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl p-6 text-left transition-all block"
                    >
                        <div className="text-3xl mb-2">➕</div>
                        <h3 className="text-xl font-bold mb-1">Add Product</h3>
                        <p className="text-sm text-purple-100">List a new item for sale</p>
                    </Link>

                    <Link
                        href="/dashboard/vendor/products"
                        className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-purple-500/50 text-white rounded-2xl p-6 text-left transition-all block"
                    >
                        <div className="text-3xl mb-2">📦</div>
                        <h3 className="text-xl font-bold mb-1">My Products</h3>
                        <p className="text-sm text-purple-200">Manage your listings</p>
                    </Link>

                    <button className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-purple-500/50 text-white rounded-2xl p-6 text-left transition-all">
                        <div className="text-3xl mb-2">💬</div>
                        <h3 className="text-xl font-bold mb-1">WhatsApp Menu</h3>
                        <p className="text-sm text-purple-200">Share to WhatsApp Status</p>
                    </button>
                </div>

                {/* Recent Orders */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Recent Orders</h2>

                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-purple-200 text-lg">No orders yet</p>
                            <p className="text-purple-300 text-sm mt-2">
                                Orders will appear here when students start buying your products
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-white font-semibold">
                                                {order.product.title}
                                            </h3>
                                            <p className="text-sm text-purple-300">
                                                Customer: {order.student.name || 'Anonymous'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-white">
                                                GH₵{order.amount.toFixed(2)}
                                            </div>
                                            <div className="text-sm">
                                                {order.escrowStatus === 'HELD' && (
                                                    <span className="text-yellow-400">🔒 In Escrow</span>
                                                )}
                                                {order.escrowStatus === 'RELEASED' && (
                                                    <span className="text-green-400">✅ Released</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* War Room Analytics Teaser */}
                <div className="mt-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl">🔥</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                War Room Analytics
                            </h2>
                            <p className="text-orange-200">
                                Real-time demand intelligence (Coming Soon)
                            </p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-black/20 rounded-xl p-4">
                            <div className="text-sm text-orange-300 mb-1">Trending Now</div>
                            <div className="text-lg font-bold text-white">Indomie 🍜</div>
                            <div className="text-xs text-orange-200">80% search increase</div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-4">
                            <div className="text-sm text-orange-300 mb-1">Peak Hours</div>
                            <div className="text-lg font-bold text-white">8PM - 11PM</div>
                            <div className="text-xs text-orange-200">Night market rush</div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-4">
                            <div className="text-sm text-orange-300 mb-1">Stock Alert</div>
                            <div className="text-lg font-bold text-white">Restock Now</div>
                            <div className="text-xs text-orange-200">High demand detected</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
