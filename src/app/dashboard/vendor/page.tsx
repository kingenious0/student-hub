'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesChart } from "@/components/vendor/SalesChart";
import { DataTable } from "@/components/ui/data-table";
import { columns, RecentOrder } from "./columns";

// Icons (Lucide)
import { Package, ShoppingCart, DollarSign, Clock, Zap, Plus, Settings, ArrowRight } from "lucide-react";

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
        monthlyRevenue: [],
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-surface border-b border-surface-border -mx-4 px-4 py-8 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Vendor Command</h1>
                        <p className="text-foreground/60 font-medium">Welcome back, <span className="text-primary">{user?.firstName}</span></p>
                    </div>
                    <div className="flex gap-3">
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

            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-surface border-surface-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₵{stats.totalEarnings.toFixed(2)}</div>
                            <p className="text-xs text-foreground/60">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-surface border-surface-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
                            <p className="text-xs text-foreground/60">+180 from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-surface border-surface-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products</CardTitle>
                            <Package className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProducts}</div>
                            <p className="text-xs text-foreground/60">{stats.activeFlashSales} active flash sales</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-surface border-surface-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
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

                        {/* Quick Actions (Shadcn Style) */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 border-none text-white hover:scale-[1.02] transition-transform cursor-pointer">
                                <CardHeader>
                                    <Package className="h-8 w-8 mb-2 opacity-80" />
                                    <CardTitle>Manage Inventory</CardTitle>
                                    <CardDescription className="text-blue-100">Update stock & prices</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-none text-white hover:scale-[1.02] transition-transform cursor-pointer">
                                <CardHeader>
                                    <Zap className="h-8 w-8 mb-2 opacity-80" />
                                    <CardTitle>Flash Sales</CardTitle>
                                    <CardDescription className="text-purple-100">Create limited time deals</CardDescription>
                                </CardHeader>
                            </Card>
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
        </div>
    );
}
