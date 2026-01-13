'use client';

import { useState, useEffect } from 'react';

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/vendor/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReady = async (orderId: string) => {
        try {
            const res = await fetch(`/api/vendor/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'READY_FOR_PICKUP' }),
            });

            if (res.ok) {
                alert('✅ Order marked as ready!');
                fetchOrders();
            } else {
                alert('❌ Failed to update order');
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-surface border-b border-surface-border py-6 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Orders</h1>
                    <p className="text-foreground/60 mt-1">Manage customer orders</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${filter === f
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-surface border border-surface-border hover:border-primary'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">🛒</div>
                        <h2 className="text-2xl font-black mb-2">No Orders</h2>
                        <p className="text-foreground/60">
                            {filter === 'ALL' ? 'No orders yet' : `No ${filter.toLowerCase().replace('_', ' ')} orders`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-surface border-2 border-surface-border rounded-2xl p-6 hover:border-primary transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-black text-lg">{order.product?.title || 'Product'}</h3>
                                                <p className="text-sm text-foreground/60">Order #{order.id.slice(0, 8)}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                    order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        order.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-purple-500/10 text-purple-500'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-foreground/40 text-xs uppercase tracking-wider mb-1">Customer</p>
                                                <p className="font-bold">{order.student?.name || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <p className="text-foreground/40 text-xs uppercase tracking-wider mb-1">Amount</p>
                                                <p className="font-black text-primary text-lg">₵{order.amount.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-foreground/40 text-xs uppercase tracking-wider mb-1">Date</p>
                                                <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {order.pickupCode && (
                                            <div className="mt-4 p-3 bg-background rounded-xl border border-surface-border">
                                                <p className="text-xs text-foreground/60 mb-1">Pickup Code</p>
                                                <p className="text-2xl font-black tracking-widest text-primary">{order.pickupCode}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleMarkReady(order.id)}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform whitespace-nowrap"
                                        >
                                            Mark Ready
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
