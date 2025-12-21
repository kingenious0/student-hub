// src/app/dashboard/vendor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import VendorOnboarding from '@/components/vendor/VendorOnboarding';

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
    const [vendorInfo, setVendorInfo] = useState<{
        role: string;
        status: string;
        shopName?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        heldInEscrow: 0,
        totalProducts: 0,
    });
    const [showHistory, setShowHistory] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchStats();
    }, []);

    const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));
    const historyOrders = orders.filter(o => ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/vendor/stats');
            const data = await res.json();

            if (data.success) {
                setStats(data.stats);
                setOrders(data.orders);
                setVendorInfo(data.vendor);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Onboarding UI if not a vendor yet
    if (vendorInfo?.role !== 'VENDOR') {
        return <VendorOnboarding onComplete={fetchStats} />;
    }

    // Pending Approval UI
    if (vendorInfo?.status === 'PENDING') {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-8 omni-glow">
                    ⏳
                </div>
                <h1 className="text-4xl font-black text-foreground mb-4 tracking-tighter uppercase">Application Pending</h1>
                <p className="text-foreground/40 max-w-md mx-auto mb-8 font-medium">
                    The OMNI Gatekeepers are reviewing your shop: <span className="text-primary">{vendorInfo.shopName}</span>.
                    You will get dashboard access once approved.
                </p>
                <Link href="/marketplace" className="px-8 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground/60 rounded-xl font-bold transition-all text-xs uppercase tracking-widest">
                    Return to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-foreground mb-2 uppercase tracking-tighter">
                        OMNI PARTNER DASHBOARD
                    </h1>
                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">
                        Operational Status: <span className="text-primary">ACTIVE</span> • Welcome, {user?.firstName || 'Partner'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-surface backdrop-blur-lg border border-surface-border rounded-2xl p-6">
                        <div className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-2">Total Orders</div>
                        <div className="text-3xl font-black text-foreground">{stats.totalOrders}</div>
                    </div>

                    <div className="bg-surface backdrop-blur-lg border border-surface-border rounded-2xl p-6">
                        <div className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-2">Pending Orders</div>
                        <div className="text-3xl font-black text-yellow-400">{stats.pendingOrders}</div>
                    </div>

                    <div className="bg-surface backdrop-blur-lg border border-surface-border rounded-2xl p-6">
                        <div className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-2">Completed</div>
                        <div className="text-3xl font-black text-green-400">{stats.completedOrders}</div>
                    </div>

                    <div className="bg-surface backdrop-blur-lg border border-surface-border rounded-2xl p-6">
                        <div className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-2">Total Revenue</div>
                        <div className="text-3xl font-black text-foreground">
                            ₵{stats.totalRevenue.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-surface backdrop-blur-lg border border-surface-border rounded-2xl p-6">
                        <div className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-2">Products Listed</div>
                        <div className="text-3xl font-black text-primary">{stats.totalProducts}</div>
                    </div>
                </div>

                {/* Escrow Alert */}
                {stats.heldInEscrow > 0 && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-[2rem] p-8 mb-8 flex items-center gap-6 shadow-2xl">
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-yellow-500/30">
                            🛡️
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-yellow-300 mb-1 uppercase tracking-tighter">
                                OMNI Escrow Shield
                            </h3>
                            <p className="text-yellow-200/70 font-medium">
                                <span className="text-foreground font-bold text-lg">₵{stats.heldInEscrow.toFixed(2)}</span> held in secure escrow. Provide the student&apos;s Secure-Key to release instantly.
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/products/new"
                        className="bg-gradient-to-r from-primary to-primary/60 text-primary-foreground rounded-[2rem] p-8 text-left transition-all block shadow-lg hover:scale-[1.02]"
                    >
                        <div className="text-4xl mb-3">➕</div>
                        <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter text-white">Add Product</h3>
                        <p className="text-sm text-white/70 font-medium opacity-80">List a new item for sale</p>
                    </Link>

                    <Link
                        href="/dashboard/vendor/products"
                        className="bg-surface backdrop-blur-lg border border-surface-border hover:border-primary/50 text-foreground rounded-[2rem] p-8 text-left transition-all block shadow-lg hover:scale-[1.02]"
                    >
                        <div className="text-4xl mb-3">📦</div>
                        <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">My Products</h3>
                        <p className="text-sm text-foreground/40 font-medium opacity-80 text-foreground/40">Manage your inventories</p>
                    </Link>

                    <Link
                        href="/dashboard/vendor/scan"
                        className="bg-background/40 backdrop-blur-lg border border-surface-border hover:border-green-500/50 text-foreground rounded-[2rem] p-8 text-left transition-all block shadow-lg hover:scale-[1.02] group"
                    >
                        <div className="text-4xl mb-3 group-hover:rotate-12 transition-transform">🔑</div>
                        <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">Unlock Funds</h3>
                        <p className="text-sm text-green-300 font-medium opacity-80">Enter Secure-Key to get paid</p>
                    </Link>

                    <button className="bg-surface backdrop-blur-lg border border-surface-border hover:border-primary/50 text-foreground rounded-[2rem] p-8 text-left transition-all shadow-lg hover:scale-[1.02]">
                        <div className="text-4xl mb-3">💬</div>
                        <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">WhatsApp Menu</h3>
                        <p className="text-sm text-foreground/40 font-medium opacity-80">Share to WhatsApp Status</p>
                    </button>
                </div>

                {/* 📦 Order Operations Center */}
                <div className="bg-surface backdrop-blur-lg border border-surface-border rounded-[2.5rem] p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">Order Operations</h2>
                            <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Manage active and historical customer requests</p>
                        </div>

                        <div className="flex bg-background/40 p-1.5 rounded-2xl border border-surface-border">
                            <button
                                onClick={() => { setShowHistory(false); setPage(1); }}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${!showHistory ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground/20 hover:text-foreground/40'}`}
                            >
                                ACTIVE
                            </button>
                            <button
                                onClick={() => { setShowHistory(true); setPage(1); }}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${showHistory ? 'bg-primary text-primary-foreground shadow-lg' : 'text-foreground/20 hover:text-foreground/40'}`}
                            >
                                ARCHIVE
                            </button>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-24 bg-background/20 rounded-[2rem] border border-dashed border-surface-border">
                            <div className="text-8xl mb-6 opacity-30"> Deserted 🌵 </div>
                            <h3 className="text-2xl font-black text-foreground/50 uppercase italic tracking-widest">Digital Silence</h3>
                            <p className="text-foreground/20 font-black text-[10px] uppercase tracking-[0.3em] max-w-xs mx-auto mt-2">The marketplace is waiting. Check your inventory levels.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(() => {
                                const list = showHistory ? historyOrders : activeOrders;
                                const ITEMS_PER_PAGE = 5;
                                const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
                                const currentItems = list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

                                if (list.length === 0) {
                                    return (
                                        <div className="text-center py-12 text-white/20 font-black text-xs uppercase tracking-widest">
                                            No {showHistory ? 'archived' : 'active'} orders found
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        {currentItems.map((order) => (
                                            <div
                                                key={order.id}
                                                className={`group relative overflow-hidden bg-surface border border-surface-border rounded-2xl p-5 hover:border-primary/30 transition-all ${showHistory ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl border border-primary/20">
                                                            📦
                                                        </div>
                                                        <div>
                                                            <h3 className="text-foreground font-black text-lg uppercase tracking-tight leading-none mb-1">
                                                                {order.product.title}
                                                            </h3>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-foreground/30 uppercase">Customer:</span>
                                                                <span className="text-xs font-black text-foreground">{order.student.name || 'Anonymous Student'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                                                        <div className="text-right">
                                                            <div className="text-xl font-black text-foreground leading-none mb-1">
                                                                ₵{order.amount.toFixed(2)}
                                                            </div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest">
                                                                {order.escrowStatus === 'HELD' && (
                                                                    <span className="text-yellow-400">🛡️ Held in Escrow</span>
                                                                )}
                                                                {order.escrowStatus === 'RELEASED' && (
                                                                    <span className="text-green-400">✅ Funds Released</span>
                                                                )}
                                                                {order.escrowStatus === 'REFUNDED' && (
                                                                    <span className="text-red-400">↩️ Refunded</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {!showHistory && order.status === 'PAID' && (
                                                                <button className="px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground text-[10px] font-black rounded-lg transition-all shadow-lg active:scale-95 uppercase tracking-widest">
                                                                    Mark Preparing
                                                                </button>
                                                            )}
                                                            <Link
                                                                href={`/dashboard/vendor/orders/${order.id}`}
                                                                className="p-3 bg-foreground/5 hover:bg-foreground/10 border border-surface-border rounded-xl transition-all"
                                                            >
                                                                👁️
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status Progress Sparkline */}
                                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground/5 overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000 ${order.status === 'COMPLETED' ? 'w-full' :
                                                            order.status === 'CANCELLED' ? 'w-full bg-red-500' : 'w-1/3'
                                                            }`}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between pt-6">
                                                <button
                                                    disabled={page === 1}
                                                    onClick={() => setPage(p => p - 1)}
                                                    className="px-6 py-2 bg-foreground/5 hover:bg-foreground/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-foreground"
                                                >
                                                    Previous
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    {Array.from({ length: totalPages }).map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setPage(i + 1)}
                                                            className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-foreground/5 text-foreground/40 hover:text-foreground'}`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    disabled={page === totalPages}
                                                    onClick={() => setPage(p => p + 1)}
                                                    className="px-6 py-2 bg-foreground/5 hover:bg-foreground/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-foreground"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
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
