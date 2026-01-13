'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorDashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        activeFlashSales: 0,
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        if (isLoaded && user) {
            fetchDashboardData();
        }
    }, [isLoaded, user]);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/vendor/dashboard');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setRecentOrders(data.recentOrders || []);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Vendor Dashboard</h1>
                    <p className="text-white/80 font-bold">Manage your shop, products, and orders</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        icon="📦"
                        label="Products"
                        value={stats.totalProducts}
                        color="blue"
                    />
                    <StatCard
                        icon="🛒"
                        label="Orders"
                        value={stats.totalOrders}
                        color="green"
                    />
                    <StatCard
                        icon="💰"
                        label="Earnings"
                        value={`₵${stats.totalEarnings.toFixed(2)}`}
                        color="yellow"
                    />
                    <StatCard
                        icon="⏳"
                        label="Pending"
                        value={stats.pendingOrders}
                        color="orange"
                    />
                    <StatCard
                        icon="⚡"
                        label="Flash Sales"
                        value={stats.activeFlashSales}
                        color="purple"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <QuickAction
                        href="/dashboard/vendor/products/new"
                        icon="➕"
                        label="Add Product"
                        color="from-blue-500 to-cyan-500"
                    />
                    <QuickAction
                        href="/dashboard/vendor/products"
                        icon="📦"
                        label="Manage Products"
                        color="from-green-500 to-emerald-500"
                    />
                    <QuickAction
                        href="/dashboard/vendor/orders"
                        icon="🛒"
                        label="View Orders"
                        color="from-orange-500 to-red-500"
                    />
                    <QuickAction
                        href="/dashboard/vendor/flash-sales"
                        icon="⚡"
                        label="Flash Sales"
                        color="from-purple-500 to-pink-500"
                    />
                </div>

                {/* Recent Orders */}
                <div className="bg-surface border-2 border-surface-border rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Recent Orders</h2>
                        <Link
                            href="/dashboard/vendor/orders"
                            className="text-primary hover:underline font-bold text-sm"
                        >
                            View All →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🛒</div>
                            <p className="text-foreground/60 font-bold">No orders yet</p>
                            <p className="text-sm text-foreground/40 mt-2">Orders will appear here when customers buy your products</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-background border border-surface-border rounded-xl p-4 hover:border-primary transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-foreground">{order.product?.title || 'Product'}</p>
                                            <p className="text-sm text-foreground/60">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-xs text-foreground/40 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-primary">₵{order.amount.toFixed(2)}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                    order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    const colors = {
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        yellow: 'from-yellow-500 to-orange-500',
        orange: 'from-orange-500 to-red-500',
        purple: 'from-purple-500 to-pink-500',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} p-6 rounded-2xl text-white`}>
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-3xl font-black mb-1">{value}</div>
            <div className="text-sm font-bold opacity-90">{label}</div>
        </div>
    );
}

function QuickAction({ href, icon, label, color }: any) {
    return (
        <Link
            href={href}
            className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white hover:scale-105 transition-transform text-center`}
        >
            <div className="text-5xl mb-3">{icon}</div>
            <div className="font-black text-lg">{label}</div>
        </Link>
    );
}
