'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesChart } from "@/components/vendor/SalesChart";
import { DataTable } from "@/components/ui/data-table";
import { columns, RecentOrder } from "./columns";
import QuickAvailability from '@/components/vendor/QuickAvailability';
import AnalyticsDashboard from '@/components/vendor/AnalyticsDashboard';
import { toast } from 'sonner';

// Icons (Lucide)
import { Package, ShoppingCart, DollarSign, Clock, Zap, Plus, Settings, ArrowRight, ChefHat, Users, Timer, Share2, Copy } from "lucide-react";

export default function VendorDashboard() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [shopName, setShopName] = useState<string | null>(null);
    const [vendorTier, setVendorTier] = useState<'FOOD' | 'GOODS' | 'MIXED' | null>(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        activeFlashSales: 0,
        monthlyRevenue: [],
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

    useEffect(() => {
        if (isLoaded && user) {
            fetchTier();
            fetchDashboardData();
            fetchUserProfile();
        }
    }, [isLoaded, user]);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch('/api/users/me');
            if (res.ok) {
                const data = await res.json();
                if (data.id) {
                    setUserId(data.id);
                    setShopName(data.shopName);
                }
            }
        } catch {}
    };

    const fetchTier = async () => {
        try {
            const res = await fetch('/api/vendor/tier');
            if (res.ok) {
                const d = await res.json();
                setVendorTier(d.tier);
            }
        } catch { }
    };

    const fetchDashboardData = async () => {
        try {
            const token = await getToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/vendor/dashboard', { headers });
            if (res.ok) {
                const data = await res.json();
                setStats({
                    ...data.stats,
                    monthlyRevenue: data.monthlyRevenue || []
                });
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

    const isFood = vendorTier === 'FOOD';
    const isGoods = vendorTier === 'GOODS';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-surface border-b border-surface-border -mx-4 px-4 py-8 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">{isFood ? 'Food Command' : isGoods ? 'Shop Command' : 'Vendor Command'}</h1>
                        <p className="text-foreground/60 font-medium">Welcome back, <span className="text-primary">{user?.firstName}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/vendor/earnings">
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none shadow-md shadow-emerald-500/10">
                                💰 Withdraw Funds
                            </Button>
                        </Link>
                        <Link href="/dashboard/vendor/products/new">
                            <Button className="bg-primary text-black font-bold hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" /> Add Product
                            </Button>
                        </Link>
                        <Link href="/dashboard/vendor/settings">
                            <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Share Your Store Section */}
            {userId && (
                <div className="bg-gradient-to-r from-primary/5 to-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Share2 className="h-5 w-5 text-primary" />
                                Share Your Store
                            </h3>
                            <p className="text-sm text-foreground/60">
                                Share your public storefront link with students on WhatsApp
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={async () => {
                                    const url = `${window.location.origin}/vendor/${userId}`;
                                    try {
                                        await navigator.clipboard.writeText(url);
                                        toast.success('Store link copied!');
                                    } catch {
                                        toast.error('Failed to copy link');
                                    }
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-surface-border rounded-xl hover:border-primary/30 text-foreground font-bold text-xs uppercase tracking-wider transition-all"
                            >
                                <Copy className="h-4 w-4" />
                                Copy Link
                            </button>
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(`🛒 Check out ${shopName || user?.firstName || 'my store'} on OMNI Student Marketplace!\n\nBrowse products and order directly:\n${window.location.origin}/vendor/${userId}\n\n📱 Powered by OMNI`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <span className="text-base">📱</span>
                                Share on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-surface border-surface-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-2xl font-bold">₵{stats.totalEarnings.toFixed(2)}</div>
                                <p className="text-xs text-foreground/60">+20.1% from last month</p>
                            </div>
                            <Link href="/dashboard/vendor/earnings" className="block pt-1">
                                <Button size="sm" className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-bold text-xs uppercase tracking-wider h-8">
                                    💰 Payout Hub
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card className="bg-surface border-surface-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-primary animate-pulse" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
                            <p className="text-xs text-foreground/60">+180 from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-surface border-surface-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products</CardTitle>
                            <Package className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProducts}</div>
                            <p className="text-xs text-foreground/60">{stats.activeFlashSales} active flash sales</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-surface border-surface-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                            <p className="text-xs text-foreground/60">Orders to fulfill</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
                    {/* Left Column: Analytics (4 cols) */}
                    <div className="md:col-span-4 space-y-8">
                        <SalesChart data={stats.monthlyRevenue} />

                        {/* Quick Actions — Type-Specific */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {!isGoods && <Link href="/dashboard/vendor/kds" className="block col-span-1">
                                <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-none text-white hover:scale-[1.02] transition-transform cursor-pointer h-full shadow-lg">
                                    <CardHeader>
                                        <ChefHat className="h-8 w-8 mb-2 text-white" />
                                        <CardTitle>Kitchen Display</CardTitle>
                                        <CardDescription className="text-emerald-100">Live order view</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>}
                            <Link href="/dashboard/vendor/products" className="block col-span-1">
                                <Card className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-surface-border/50 text-white hover:scale-[1.02] transition-transform cursor-pointer h-full shadow-lg">
                                    <CardHeader>
                                        <Package className="h-8 w-8 mb-2 text-primary" />
                                        <CardTitle>{isFood ? 'Menu' : 'Inventory'}</CardTitle>
                                        <CardDescription className="text-slate-300">{isFood ? 'Manage food items & modifiers' : 'Update stock & prices'}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                            {!isFood && <Link href="/dashboard/vendor/flash-sales" className="block col-span-1">
                                <Card className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-surface-border/50 text-white hover:scale-[1.02] transition-transform cursor-pointer h-full shadow-lg">
                                    <CardHeader>
                                        <Zap className="h-8 w-8 mb-2 text-primary animate-pulse" />
                                        <CardTitle>Flash Sales</CardTitle>
                                        <CardDescription className="text-slate-300">Time-limited deals</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>}
                            {!isGoods && <Link href="/dashboard/vendor/hours" className="block col-span-1">
                                <Card className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-surface-border/50 text-white hover:scale-[1.02] transition-transform cursor-pointer h-full shadow-lg">
                                    <CardHeader>
                                        <Timer className="h-8 w-8 mb-2 text-primary" />
                                        <CardTitle>Hours</CardTitle>
                                        <CardDescription className="text-slate-300">Set open/close times</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>}
                            {!isGoods && <Link href="/dashboard/vendor/staff" className="block col-span-1">
                                <Card className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-surface-border/50 text-white hover:scale-[1.02] transition-transform cursor-pointer h-full shadow-lg">
                                    <CardHeader>
                                        <Users className="h-8 w-8 mb-2 text-primary" />
                                        <CardTitle>Staff</CardTitle>
                                        <CardDescription className="text-slate-300">Manage PIN accounts</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>}
                            <Link href="/dashboard/vendor/earnings" className="block col-span-1">
                                <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-none text-white hover:scale-[1.02] transition-transform cursor-pointer h-full shadow-lg">
                                    <CardHeader>
                                        <DollarSign className="h-8 w-8 mb-2 text-white" />
                                        <CardTitle>Withdrawal Vault</CardTitle>
                                        <CardDescription className="text-emerald-100">Instant MoMo payout</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Recent Orders Table (3 cols) */}
                    <div className="md:col-span-3">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black uppercase tracking-tight">Recent Orders</h2>
                                <Link href="/dashboard/vendor/orders" className="text-sm font-bold text-primary hover:underline flex items-center">
                                    View All <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                            <DataTable columns={columns} data={recentOrders} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tight">Analytics</h2>
                <AnalyticsDashboard />
            </section>

            {/* Quick Availability Toggle */}
            <section className="space-y-4">
                <QuickAvailability />
            </section>

            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>© 2026 OMNI Student Marketplace • All Rights Reserved</p>
            </div>
        </div>
    );
}
