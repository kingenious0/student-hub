// src/app/dashboard/vendor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import VendorOnboarding from '@/components/vendor/VendorOnboarding';
import VendorHeartbeat from '@/components/vendor/VendorHeartbeat';
import WithdrawModal from '@/components/vendor/WithdrawModal';
import AnalyticsCharts from '@/components/vendor/AnalyticsCharts';
import BentoOrderCard from '@/components/vendor/BentoOrderCard';
import GlowingRevenueChart from '@/components/vendor/GlowingRevenueChart';
import { useAdmin } from '@/context/AdminContext';
import ProtocolGuard from '@/components/admin/ProtocolGuard';
import SimpleEdit from '@/components/admin/SimpleEdit';

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
    const { isGhostAdmin } = useAdmin();

    const [orders, setOrders] = useState<Order[]>([]);
    const [vendorInfo, setVendorInfo] = useState<{
        role: string;
        vendorStatus: string;
        shopName?: string;
        isAcceptingOrders?: boolean;
        balance?: number;
    } | null>(null);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [analytics, setAnalytics] = useState<{ salesChart: any[]; topProducts: any[] } | null>(null);
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
        const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));
        const historyOrders = orders.filter(o => ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));

        // Mobile Bridge Auth
        const searchParams = useSearchParams();
        const omniToken = searchParams?.get('__omni_token');

        // Stats Fetcher
        const fetchStats = async () => {
            try {
                const headers: HeadersInit = {};
                if (omniToken) {
                    headers['Authorization'] = `Bearer ${omniToken}`;
                }

                const res = await fetch('/api/vendor/stats', {
                    cache: 'no-store',
                    headers
                });
                const data = await res.json();

                if (data.vendor) {
                    setVendorInfo(data.vendor);
                }
                if (data.stats) setStats(data.stats);
                if (data.analytics) setAnalytics(data.analytics);
                if (data.orders) setOrders(data.orders);

            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false); // Keep setLoading here to ensure loading state is cleared
            }
        };

        useEffect(() => {
            fetchStats();
        }, [user, omniToken]); // Add user and omniToken dependency

        const toggleRushMode = async () => {
            if (!vendorInfo) return;
            const newState = !vendorInfo.isAcceptingOrders;

            // Optimistic update
            setVendorInfo(prev => prev ? ({ ...prev, isAcceptingOrders: newState }) : null);

            try {
                await fetch('/api/vendor/status', {
                    method: 'POST',
                    body: JSON.stringify({ isAcceptingOrders: newState })
                });
            } catch (e) {
                // Revert on fail
                setVendorInfo(prev => prev ? ({ ...prev, isAcceptingOrders: !newState }) : null);
            }
        };

        if (loading) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            );
        }

        // Onboarding UI if not a vendor yet (Bypass for Admin)
        if (vendorInfo?.role !== 'VENDOR' && !isGhostAdmin) {
            return (
                <div className="relative">
                    <div className="bg-red-500/10 text-red-500 p-2 text-[10px] font-mono text-center border-b border-red-500/20">
                        DEBUG: Role={String(vendorInfo?.role)} | Status={String(vendorInfo?.vendorStatus)} | ID={user?.id?.slice(-5)}
                    </div>
                    <VendorOnboarding onComplete={fetchStats} />
                </div>
            );
        }

        // Pending Approval UI (Bypass for Admin)
        if (vendorInfo?.vendorStatus === 'PENDING' && !isGhostAdmin) {
            return (
                <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-8 omni-glow">
                        ⏳
                    </div>
                    <h1 className="text-4xl font-black text-foreground mb-4 tracking-tighter uppercase">Application Pending</h1>
                    <p className="text-foreground/40 max-w-md mx-auto mb-8 font-medium">
                        The OMNI Gatekeepers are reviewing your shop: <span className="text-primary">{vendorInfo?.shopName || 'Your Shop'}</span>.
                        You will get dashboard access once approved.
                    </p>
                    <Link href="/marketplace" className="px-8 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground/60 rounded-xl font-bold transition-all text-xs uppercase tracking-widest">
                        Return to Marketplace
                    </Link>
                </div>
            );
        }

        // Suspended Account UI (Bypass for Admin)
        if (vendorInfo?.vendorStatus === 'SUSPENDED' && !isGhostAdmin) {
            return (
                <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-4xl mb-8">
                        🚫
                    </div>
                    <h1 className="text-4xl font-black text-red-500 mb-4 tracking-tighter uppercase">Account Suspended</h1>
                    <p className="text-foreground/40 max-w-md mx-auto mb-8 font-medium">
                        Your vendor account has been suspended. Please contact OMNI support for more information.
                    </p>
                    <Link href="/marketplace" className="px-8 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground/60 rounded-xl font-bold transition-all text-xs uppercase tracking-widest">
                        Return to Marketplace
                    </Link>
                </div>
            );
        }

        return (
            <ProtocolGuard protocol="VENDOR">
                <div className="min-h-screen bg-background transition-colors duration-300">
                    <VendorHeartbeat />
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        {/* Header */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <SimpleEdit
                                    id="vendor_dashboard_title"
                                    text="OMNI PARTNER DASHBOARD"
                                    tag="h1"
                                    className="text-4xl font-black text-foreground mb-2 uppercase tracking-tighter"
                                />
                                <p className="text-foreground/50 font-bold uppercase tracking-widest text-[10px]">
                                    Status: <span className="text-primary">ACTIVE</span> • Welcome, {user?.firstName || 'Partner'}
                                </p>
                            </div>

                            {/* Rush Mode Toggle */}
                            <button
                                onClick={toggleRushMode}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${vendorInfo?.isAcceptingOrders
                                    ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
                                    : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full ${vendorInfo?.isAcceptingOrders ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <div className="text-left">
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${vendorInfo?.isAcceptingOrders ? 'text-green-500' : 'text-red-500'}`}>
                                        {vendorInfo?.isAcceptingOrders ? 'ONLINE' : 'RUSH MODE OFF'}
                                    </div>
                                    <div className="text-[10px] text-foreground/40 font-bold">
                                        {vendorInfo?.isAcceptingOrders ? 'Accepting Orders' : 'Store Paused'}
                                    </div>
                                </div>
                            </button>
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

                        {/* Wallet Section */}
                        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/20 border border-green-500/20 rounded-[2rem] p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-3xl text-green-400 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                    💰
                                </div>
                                <div>
                                    <div className="text-green-500/509 text-[20px] font-black uppercase tracking-widest mb-1">Available Wallet Balance</div>
                                    <div className="text-4xl font-black text-white tracking-tight">
                                        ₵{vendorInfo?.balance?.toFixed(2) || '0.00'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setWithdrawOpen(true)}
                                className="relative z-10 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-green-500/20 active:scale-95"
                            >
                                Withdraw Funds
                            </button>
                            <WithdrawModal
                                isOpen={withdrawOpen}
                                onClose={() => setWithdrawOpen(false)}
                                maxAmount={vendorInfo?.balance || 0}
                                onSuccess={fetchStats}
                            />
                        </div>

                        {/* Glowing Revenue Chart */}
                        <GlowingRevenueChart data={analytics?.salesChart || []} />

                        {/* Keep original product chart below if needed */}
                        <AnalyticsCharts salesData={[]} productData={analytics?.topProducts || []} />

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
                                <SimpleEdit id="vendor_card_add_product" text="Add Product" tag="h3" className="text-2xl font-black mb-1 uppercase tracking-tighter text-white" />
                                <p className="text-sm text-white/70 font-medium opacity-80">List a new item for sale</p>
                            </Link>

                            <Link
                                href="/stories/new"
                                className="bg-black/80 backdrop-blur-lg border border-purple-500/50 text-white rounded-[2rem] p-8 text-left transition-all block shadow-lg hover:scale-[1.02] relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl group-hover:scale-110 transition-transform">⚡</div>
                                <div className="text-4xl mb-3">📹</div>
                                <SimpleEdit id="vendor_card_post_story" text="Post Story" tag="h3" className="text-2xl font-black mb-1 uppercase tracking-tighter" />
                                <p className="text-sm text-purple-200 font-medium opacity-80">Engage students on Campus Pulse</p>
                            </Link>

                            <Link
                                href="/dashboard/vendor/products"
                                className="bg-surface backdrop-blur-lg border border-surface-border hover:border-primary/50 text-foreground rounded-[2rem] p-8 text-left transition-all block shadow-lg hover:scale-[1.02]"
                            >
                                <div className="text-4xl mb-3">📦</div>
                                <SimpleEdit id="vendor_card_my_products" text="My Products" tag="h3" className="text-2xl font-black mb-1 uppercase tracking-tighter" />
                                <p className="text-sm text-foreground/40 font-medium opacity-80 text-foreground/40">Manage your inventories</p>
                            </Link>

                            <Link
                                href="/dashboard/vendor/scan"
                                className="bg-background/40 backdrop-blur-lg border border-surface-border hover:border-green-500/50 text-foreground rounded-[2rem] p-8 text-left transition-all block shadow-lg hover:scale-[1.02] group"
                            >
                                <div className="text-4xl mb-3 group-hover:rotate-12 transition-transform">🔑</div>
                                <SimpleEdit id="vendor_card_unlock_funds" text="Unlock Funds" tag="h3" className="text-2xl font-black mb-1 uppercase tracking-tighter" />
                                <p className="text-sm text-green-600 font-medium opacity-80">Enter Secure-Key to get paid</p>
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
                                    <SimpleEdit id="vendor_order_operations_title" text="Order Operations" tag="h2" className="text-3xl font-black text-foreground uppercase tracking-tighter" />
                                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Manage active and historical customer requests</p>
                                </div>

                                <div className="flex bg-background/80 p-1.5 rounded-2xl border border-surface-border">
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
                                <div className="text-center py-24 glass rounded-[3rem] border-2 border-dashed border-surface-border relative overflow-hidden">
                                    <div className="absolute inset-0 gradient-mesh opacity-30"></div>
                                    <div className="relative z-10">
                                        <div className="text-8xl mb-6 opacity-30 animate-float">📡</div>
                                        <h3 className="text-2xl font-black text-foreground/50 uppercase tracking-widest mb-4">Digital Silence</h3>
                                        <p className="text-foreground/30 font-bold text-xs uppercase tracking-[0.3em] max-w-xs mx-auto mb-8">
                                            The marketplace is waiting. Boost your visibility:
                                        </p>
                                        <div className="flex flex-wrap gap-3 justify-center max-w-md mx-auto">
                                            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-black uppercase">
                                                ✓ Post a Story
                                            </div>
                                            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-black uppercase">
                                                ✓ Add More Products
                                            </div>
                                            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-black uppercase">
                                                ✓ Enable Rush Mode
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(() => {
                                        const list = showHistory ? historyOrders : activeOrders;
                                        const ITEMS_PER_PAGE = 6; // Changed to 6 for better grid layout
                                        const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
                                        const currentItems = list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

                                        if (list.length === 0) {
                                            return (
                                                <div className="col-span-full text-center py-12 text-white/20 font-black text-xs uppercase tracking-widest">
                                                    No {showHistory ? 'archived' : 'active'} orders found
                                                </div>
                                            );
                                        }

                                        return (
                                            <>
                                                {currentItems.map((order) => (
                                                    <BentoOrderCard key={order.id} order={order} />
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
            </ProtocolGuard>
        );
    }
