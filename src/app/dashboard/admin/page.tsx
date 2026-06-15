'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Activity, 
  Users, 
  Store, 
  Shield, 
  RefreshCw, 
  ArrowRight,
  Sliders,
  Radio,
  UserCheck,
  Send,
  Lock,
  LayoutDashboard,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    pendingVendors: number;
}

interface OrderItem {
    id: string;
    amount: number;
    status: string;
    items?: Array<{
        product?: {
            title?: string;
        };
    }>;
    student?: {
        name: string;
    };
    vendor?: {
        shopName: string;
    };
}

interface AuditLog {
    id: string;
    action: string;
    adminId: string;
    details?: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
    const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setRecentOrders(data.recentOrders);
                setRecentLogs(data.recentLogs || []);
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 120, damping: 18 } 
        }
    };

    const sidebarLinks = [
        { href: '/dashboard/admin/vetting', label: 'Partner Vetting', icon: Store },
        { href: '/dashboard/admin/controls', label: 'System Controls', icon: Sliders },
        { href: '/dashboard/admin/signals', label: 'Signal Intel', icon: Radio },
        { href: '/dashboard/admin/users', label: 'Entity Database', icon: UserCheck },
        { href: '/dashboard/admin/communication', label: 'Comms Uplink', icon: Send },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sticky Navigation Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-surface-border p-6 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:shrink-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="space-y-8">
                    {/* Brand Identity */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary text-black font-black flex items-center justify-center rounded-xl text-lg shadow-md shadow-primary/20">
                                LH
                            </div>
                            <div>
                                <span className="text-sm font-black tracking-widest text-foreground block">LAHUSTLE</span>
                                <span className="text-[9px] font-bold text-primary tracking-widest uppercase">Command Center</span>
                            </div>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-foreground/60 hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest px-3 block mb-3">Navigation</span>
                        <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/5">
                            <LayoutDashboard className="w-4 h-4 shrink-0" />
                            <span>Overview</span>
                        </Link>
                        {sidebarLinks.map((link) => (
                            <Link 
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/60 hover:text-foreground hover:bg-foreground/[0.03] border border-transparent hover:border-surface-border font-bold text-xs uppercase tracking-wider transition-all"
                            >
                                <link.icon className="w-4 h-4 shrink-0" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="space-y-4 pt-6 border-t border-surface-border">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-black text-primary">
                            OP
                        </div>
                        <div className="truncate">
                            <span className="text-[10px] font-black tracking-wider text-foreground block">CHIEF ADMINISTRATOR</span>
                            <span className="text-[9px] text-foreground/45 block truncate">godmode@lahustle.com</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-background/50">
                {/* Header Navbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-surface-border">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-foreground/[0.03] border border-surface-border rounded-xl transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative max-w-xs hidden sm:block">
                            <Search className="w-4 h-4 text-foreground/30 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search protocols..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs bg-foreground/[0.02] border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-foreground/30 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchAdminStats}
                            className="p-2.5 bg-foreground/[0.02] hover:bg-foreground/[0.05] border border-surface-border rounded-xl text-foreground/60 hover:text-primary transition-all"
                            title="Refresh statistics"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <div className="h-4 w-px bg-surface-border hidden sm:block" />
                        <span className="px-3.5 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[9px] uppercase tracking-widest hidden sm:inline-block animate-pulse">
                            Secure Link Established
                        </span>
                    </div>
                </header>

                {/* Dashboard Grid Space */}
                <main className="p-6 md:p-8 flex-1">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-7xl mx-auto space-y-8"
                    >
                        {/* Title Block */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-6">
                            <div>
                                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Command Dashboard</h1>
                                <p className="text-primary text-[9px] font-black uppercase tracking-[0.4em] mt-1">Ecosystem Telemetry & Action Grid</p>
                            </div>
                            <div className="text-[10px] font-black tracking-wider text-foreground/40 uppercase">
                                Realtime System Feed: Active
                            </div>
                        </div>

                        {/* Bento Grid Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { 
                                    label: 'Ecosystem Revenue', 
                                    value: `₵${(stats?.totalRevenue || 0).toFixed(2)}`, 
                                    icon: <DollarSign className="w-5 h-5 text-primary" />,
                                    gradient: "from-primary/20 to-transparent",
                                    color: "border-primary/20"
                                },
                                { 
                                    label: 'Active Protocols', 
                                    value: stats?.totalOrders || 0, 
                                    icon: <Activity className="w-5 h-5 text-blue-500" />,
                                    gradient: "from-blue-500/10 to-transparent",
                                    color: "border-blue-500/20"
                                },
                                { 
                                    label: 'Total Entities', 
                                    value: stats?.totalUsers || 0, 
                                    icon: <Users className="w-5 h-5 text-purple-500" />,
                                    gradient: "from-purple-500/10 to-transparent",
                                    color: "border-purple-500/20"
                                },
                                { 
                                    label: 'Pending Partners', 
                                    value: stats?.pendingVendors || 0, 
                                    icon: <Store className="w-5 h-5 text-amber-500" />,
                                    gradient: "from-amber-500/10 to-transparent",
                                    color: "border-amber-500/20",
                                    highlight: (stats?.pendingVendors || 0) > 0
                                },
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i} 
                                    variants={cardVariants}
                                    className={cn(
                                        "relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300",
                                        stat.color
                                    )}
                                >
                                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", stat.gradient)} />
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="p-2 bg-foreground/[0.02] rounded-xl border border-surface-border">
                                            {stat.icon}
                                        </div>
                                        {stat.highlight && (
                                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                                                Action
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1 relative z-10">
                                        <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] block">
                                            {stat.label}
                                        </span>
                                        <span className="text-2xl font-black font-mono tracking-tighter text-foreground block">
                                            {stat.value}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Asymmetric Mosaic Grid Row: System Feed & Security Logs */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* System Feed (Takes col-span-2) */}
                            <motion.div 
                                variants={cardVariants}
                                className="lg:col-span-2 rounded-3xl border border-surface-border bg-card shadow-sm p-6 relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
                                    <div>
                                        <h2 className="text-sm font-black text-foreground uppercase tracking-tight">System Operations Feed</h2>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-foreground/30 mt-0.5">Telemetry and Order Registry</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    {recentOrders.length === 0 ? (
                                        <p className="text-center text-foreground/20 italic text-xs py-12">No recent system transactions.</p>
                                    ) : (
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-surface-border text-foreground/40 uppercase tracking-wider font-black text-[9px]">
                                                    <th className="pb-3 font-semibold">Protocol ID</th>
                                                    <th className="pb-3 font-semibold">Asset/Product</th>
                                                    <th className="pb-3 font-semibold">Entities</th>
                                                    <th className="pb-3 font-semibold text-right">Value</th>
                                                    <th className="pb-3 font-semibold text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-border/50">
                                                {recentOrders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-foreground/[0.01] transition-colors">
                                                        <td className="py-3.5 font-mono text-foreground/40">
                                                            #{order.id.slice(0, 8).toUpperCase()}
                                                        </td>
                                                        <td className="py-3.5 font-black text-foreground">
                                                            {order.items?.[0]?.product?.title || 'System Asset'}
                                                        </td>
                                                        <td className="py-3.5 font-medium text-foreground/60">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="truncate">{order.student?.name || 'ANON'}</span>
                                                                <span className="text-foreground/20">→</span>
                                                                <span className="truncate font-semibold">{order.vendor?.shopName || 'ANON'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 text-right font-black font-mono text-primary">
                                                            ₵{order.amount.toFixed(2)}
                                                        </td>
                                                        <td className="py-3.5 text-right">
                                                            <span className={cn(
                                                                "inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                                order.status === 'COMPLETED' 
                                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                                                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                                            )}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </motion.div>

                            {/* Security Logs (Takes col-span-1) */}
                            <motion.div 
                                variants={cardVariants}
                                className="rounded-3xl border border-surface-border bg-card shadow-sm p-6 relative overflow-hidden flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
                                        <div>
                                            <h2 className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-red-500" /> Security Audit
                                            </h2>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-red-500/50 mt-0.5">Security & clearance Logs</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                        {recentLogs.length === 0 ? (
                                            <p className="text-center text-foreground/20 italic text-xs py-8">Clear event stream.</p>
                                        ) : (
                                            recentLogs.map((log) => (
                                                <div key={log.id} className="p-3 bg-foreground/[0.01] hover:bg-foreground/[0.02] border border-surface-border/50 rounded-2xl space-y-2 transition-all">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[7px] font-black uppercase tracking-wider truncate">
                                                            {log.action}
                                                        </span>
                                                        <span className="font-mono text-[8px] text-foreground/30 shrink-0">
                                                            {new Date(log.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-foreground/75 font-semibold leading-snug">
                                                        {log.details || 'N/A'}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-surface-border mt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-foreground/30">
                                    <span>Clearance required</span>
                                    <span>LEVEL 5</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Command Modules Mosaic Grid */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Active Subsystem Modules</h2>
                                <p className="text-primary text-[9px] font-black uppercase tracking-[0.2em] mt-1">Direct overrides and configuration links</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Large Card: Vetting */}
                                <motion.div 
                                    variants={cardVariants}
                                    className="md:col-span-2 p-6 bg-card border border-surface-border rounded-3xl relative overflow-hidden group flex flex-col justify-between min-h-[220px]"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">🛠️</span>
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Partner Vetting</h3>
                                        </div>
                                        <p className="text-foreground/50 font-bold uppercase tracking-wider text-[9px] leading-relaxed max-w-xl">
                                            Authorize verified merchants, evaluate submitted portfolios, and control active listings on the university grid.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex justify-between items-center">
                                        <span className="text-[8px] font-black tracking-widest text-primary uppercase">Active Candidates Pending</span>
                                        <Link href="/dashboard/admin/vetting">
                                            <button className="px-5 py-2.5 bg-primary text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                                                <span>Initialize</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>

                                {/* Smaller Card: Controls */}
                                <motion.div 
                                    variants={cardVariants}
                                    className="p-6 bg-card border border-surface-border rounded-3xl relative overflow-hidden group flex flex-col justify-between min-h-[220px]"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">🎛️</span>
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">System Controls</h3>
                                        </div>
                                        <p className="text-foreground/50 font-bold uppercase tracking-wider text-[9px] leading-relaxed">
                                            Access core parameters, modify fee splits, adjust commission structures, and set platform rules.
                                        </p>
                                    </div>
                                    <Link href="/dashboard/admin/controls" className="mt-6">
                                        <button className="w-full py-2.5 bg-foreground/[0.02] hover:bg-foreground/[0.05] border border-surface-border text-foreground rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                                            <span>Console Terminal</span>
                                            <Sliders className="w-3.5 h-3.5" />
                                        </button>
                                    </Link>
                                </motion.div>

                                {/* Smaller Card: Signal Intel */}
                                <motion.div 
                                    variants={cardVariants}
                                    className="p-6 bg-card border border-surface-border rounded-3xl relative overflow-hidden group flex flex-col justify-between min-h-[220px]"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">📡</span>
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Signal Intel</h3>
                                        </div>
                                        <p className="text-foreground/50 font-bold uppercase tracking-wider text-[9px] leading-relaxed">
                                            Intercept user feedback packets and track real-time issue transmissions from sandbox deployments.
                                        </p>
                                    </div>
                                    <Link href="/dashboard/admin/signals" className="mt-6">
                                        <button className="w-full py-2.5 bg-emerald-500 text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                            <span>Uplink Feed</span>
                                            <Radio className="w-3.5 h-3.5" />
                                        </button>
                                    </Link>
                                </motion.div>

                                {/* Large Card: Comms Uplink */}
                                <motion.div 
                                    variants={cardVariants}
                                    className="md:col-span-2 p-6 bg-card border border-surface-border rounded-3xl relative overflow-hidden group flex flex-col justify-between min-h-[220px]"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">📨</span>
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Comms Uplink</h3>
                                        </div>
                                        <p className="text-foreground/50 font-bold uppercase tracking-wider text-[9px] leading-relaxed max-w-xl">
                                            Initiate direct-link SMS beams or broadcast notifications across the local university user grid.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex justify-between items-center">
                                        <span className="text-[8px] font-black tracking-widest text-primary uppercase">Carrier Connection Online</span>
                                        <Link href="/dashboard/admin/communication">
                                            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                                                <span>Broadcast Uplink</span>
                                                <Send className="w-3.5 h-3.5" />
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
