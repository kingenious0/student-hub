// src/app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface Order {
    id: string;
    status: string;
    escrowStatus: string;
    amount: number;
    createdAt: string;
    qrCodeValue: string | null;
    product: {
        title: string;
        imageUrl: string | null;
    };
    vendor: {
        name: string | null;
        currentHotspot: string | null;
    };
}

export default function OrdersPage() {
    const { user } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // TODO: Create API endpoint to fetch user's orders
            // For now, empty array
            setOrders([]);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'text-yellow-400';
            case 'PAID':
                return 'text-blue-400';
            case 'PREPARING':
                return 'text-orange-400';
            case 'READY':
                return 'text-purple-400';
            case 'COMPLETED':
                return 'text-green-400';
            case 'CANCELLED':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '⏳';
            case 'PAID':
                return '💳';
            case 'PREPARING':
                return '👨‍🍳';
            case 'READY':
                return '✅';
            case 'COMPLETED':
                return '🎉';
            case 'CANCELLED':
                return '❌';
            default:
                return '📦';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        📦 My Orders
                    </h1>
                    <p className="text-purple-200">
                        Track your purchases and deliveries
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                        <p className="mt-4 text-purple-200">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            No orders yet
                        </h2>
                        <p className="text-purple-200 mb-6">
                            Start shopping to see your orders here
                        </p>
                        <a
                            href="/marketplace"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                        >
                            Browse Marketplace
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Product Image */}
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {order.product.imageUrl ? (
                                            <img
                                                src={order.product.imageUrl}
                                                alt={order.product.title}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-3xl">📦</span>
                                        )}
                                    </div>

                                    {/* Order Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">
                                                    {order.product.title}
                                                </h3>
                                                <p className="text-sm text-purple-300">
                                                    Vendor: {order.vendor.name || 'Anonymous'}
                                                </p>
                                                {order.vendor.currentHotspot && (
                                                    <p className="text-sm text-purple-300">
                                                        📍 {order.vendor.currentHotspot}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-white">
                                                    GH₵{order.amount.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className={`flex items-center gap-2 text-sm font-medium ${getStatusColor(order.status)}`}>
                                                <span>{getStatusIcon(order.status)}</span>
                                                {order.status}
                                            </span>
                                            {order.escrowStatus === 'HELD' && (
                                                <span className="text-sm text-yellow-400">
                                                    🔒 Funds in Escrow
                                                </span>
                                            )}
                                            {order.escrowStatus === 'RELEASED' && (
                                                <span className="text-sm text-green-400">
                                                    ✅ Payment Released
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {order.qrCodeValue && order.escrowStatus === 'HELD' && (
                                            <div className="flex gap-3">
                                                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                                    View QR Code
                                                </button>
                                                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors">
                                                    Contact Vendor
                                                </button>
                                            </div>
                                        )}
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
