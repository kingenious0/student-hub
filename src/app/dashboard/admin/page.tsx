'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Activity, 
  Users, 
  Store, 
  Shield, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Radio,
  UserCheck,
  Send,
  Lock
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
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 } 
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-12 pt-20"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">LaHustle COMMAND</h1>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mt-2">System Analytics & Oversight</p>
                    </div>
                    <div className="px-6 py-3 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/10 self-start md:self-auto">
                        Level: The Boss
                    </div>
                </div>

                {/* Grid Stats styled as mini Order Confirmation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { 
                            label: 'Ecosystem Revenue', 
                            value: `₵${(stats?.totalRevenue || 0).toFixed(2)}`, 
                            icon: <DollarSign className="w-8 h-8 text-primary" />,
                            gradient: "from-primary via-emerald-500 to-teal-500",
                            shadow: "shadow-primary/5"
                        },
                        { 
                            label: 'Active Protocols', 
                            value: stats?.totalOrders || 0, 
                            icon: <Activity className="w-8 h-8 text-blue-500" />,
                            gradient: "from-blue-500 via-indigo-600 to-purple-500",
                            shadow: "shadow-blue-500/5"
                        },
                        { 
                            label: 'Total Entities', 
                            value: stats?.totalUsers || 0, 
                            icon: <Users className="w-8 h-8 text-purple-500" />,
                            gradient: "from-purple-500 via-pink-500 to-red-500",
                            shadow: "shadow-purple-500/5"
                        },
                        { 
                            label: 'Pending Partners', 
                            value: stats?.pendingVendors || 0, 
                            icon: <Store className="w-8 h-8 text-amber-500" />,
                            gradient: "from-amber-500 via-orange-500 to-yellow-500",
                            shadow: "shadow-amber-500/5",
                            highlight: stats?.pendingVendors ? stats.pendingVendors > 0 : false
                        },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i} 
                            variants={cardVariants}
                            className={cn(
                                "relative overflow-hidden rounded-[2.5rem] border border-surface-border bg-surface p-6 shadow-xl",
                                stat.shadow
                            )}
                        >
                            {/* Top colored accent line */}
                            <div className={cn("absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r", stat.gradient)} />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-foreground/[0.04] rounded-2xl border border-surface-border">
                                    {stat.icon}
                                </div>
                                {stat.highlight && (
                                    <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                                        Action Required
                                    </span>
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] block">
                                    {stat.label}
                                </span>
                                <span className="text-3xl font-black font-mono tracking-tighter text-foreground block">
                                    {stat.value}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Feed and Security Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* System Feed (Receipt Styled Card) */}
                    <motion.div 
                        variants={cardVariants}
                        className="rounded-[2.5rem] border border-surface-border bg-surface shadow-2xl p-6 sm:p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-emerald-500" />
                        
                        <div className="flex items-center justify-between pb-6 border-b border-surface-border mb-6">
                            <div>
                                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">System Feed</h2>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 mt-0.5">Live Operations Protocol</p>
                            </div>
                            <button 
                                onClick={fetchAdminStats} 
                                className="p-2.5 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-primary border border-surface-border rounded-xl transition-all"
                                aria-label="Refresh logs"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Receipt Container */}
                        <div className="bg-foreground/[0.02] border border-surface-border rounded-3xl p-5 relative overflow-hidden space-y-4">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                            
                            {recentOrders.length === 0 ? (
                                <p className="text-center text-foreground/20 italic text-xs py-8">No recent transactions detected.</p>
                            ) : (
                                <div className="divide-y divide-dashed divide-surface-border/60">
                                    {recentOrders.map((order, idx) => (
                                        <div 
                                            key={order.id} 
                                            className={cn(
                                                "py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold",
                                                { "pt-0": idx === 0, "pb-0": idx === recentOrders.length - 1 }
                                            )}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-foreground uppercase tracking-tight text-sm">
                                                        {order.items?.[0]?.product?.title || 'Unknown Item'}
                                                    </span>
                                                    <span className="font-mono text-[9px] text-foreground/30">
                                                        #{order.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                                                    <span>S: {order.student?.name || 'ANON'}</span>
                                                    <span className="h-1 w-1 bg-foreground/20 rounded-full"></span>
                                                    <span>V: {order.vendor?.shopName || 'ANON'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <span className="font-black font-mono text-primary text-base">
                                                    ₵{order.amount.toFixed(2)}
                                                </span>
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                    order.status === 'COMPLETED' 
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                                )}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Security Audit Log */}
                    <motion.div 
                        variants={cardVariants}
                        className="rounded-[2.5rem] border border-surface-border bg-surface shadow-2xl p-6 sm:p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />
                        
                        <div className="flex items-center justify-between pb-6 border-b border-surface-border mb-6">
                            <div>
                                <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-red-500" /> Security Audit Log
                                </h2>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500/50 mt-0.5">Tamper-Proof Trace</p>
                            </div>
                        </div>

                        {/* Receipt Container */}
                        <div className="bg-foreground/[0.02] border border-surface-border rounded-3xl p-5 relative overflow-hidden space-y-4">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                            
                            {recentLogs.length === 0 ? (
                                <p className="text-center text-foreground/20 italic text-xs py-8">No recent security events detected.</p>
                            ) : (
                                <div className="divide-y divide-dashed divide-surface-border/60">
                                    {recentLogs.map((log, idx) => (
                                        <div 
                                            key={log.id} 
                                            className={cn(
                                                "py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold",
                                                { "pt-0": idx === 0, "pb-0": idx === recentLogs.length - 1 }
                                            )}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                                                        log.action.includes('PARTNER') || log.action.includes('VERIFY')
                                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    )}>
                                                        {log.action}
                                                    </span>
                                                    <span className="font-mono text-[9px] text-foreground/30">
                                                        Admin: {log.adminId.slice(0, 8).toUpperCase()}...
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-tight">
                                                    {log.details || 'N/A'}
                                                </p>
                                            </div>
                                            
                                            <span className="font-mono text-[9px] text-foreground/30 self-end sm:self-auto">
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Command Modules Grid */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Command Modules</h2>
                        <p className="text-primary text-[9px] font-black uppercase tracking-[0.2em] mt-1">Core Subsystem Protocols</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {/* 1. Partner Vetting */}
                        <motion.div 
                            variants={cardVariants}
                            className="p-8 bg-surface border border-surface-border rounded-[2.5rem] relative overflow-hidden group flex flex-col justify-between min-h-[300px]"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500" />
                            <div>
                                <div className="text-4xl mb-6">🛠️</div>
                                <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Partner Vetting</h3>
                                <p className="text-foreground/40 font-black uppercase tracking-widest text-[9px] leading-relaxed">Review, verify, and activate campus vendors to the LaHustle Network.</p>
                            </div>
                            <Link href="/dashboard/admin/vetting" className="mt-8">
                                <button className="w-full py-4 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2">
                                    <span>Enter Protocol</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </motion.div>

                        {/* 2. System Controls */}
                        <motion.div 
                            variants={cardVariants}
                            className="p-8 bg-surface border border-surface-border rounded-[2.5rem] relative overflow-hidden group flex flex-col justify-between min-h-[300px]"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-foreground/20 to-foreground/5" />
                            <div>
                                <div className="text-4xl mb-6">🎛️</div>
                                <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">System Controls</h3>
                                <p className="text-foreground/40 font-black uppercase tracking-widest text-[9px] leading-relaxed">Manage global settings, fee structure, backups, and security parameters.</p>
                            </div>
                            <Link href="/dashboard/admin/controls" className="mt-8">
                                <button className="w-full py-4 bg-surface border-2 border-surface-border text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <span>Access Terminal</span>
                                    <Sliders className="w-4 h-4" />
                                </button>
                            </Link>
                        </motion.div>

                        {/* 3. Signal Intel */}
                        <motion.div 
                            variants={cardVariants}
                            className="p-8 bg-surface border border-surface-border rounded-[2.5rem] relative overflow-hidden group flex flex-col justify-between min-h-[300px]"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39FF14] to-[#14532d]" />
                            <div>
                                <div className="text-4xl mb-6">📡</div>
                                <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Signal Intel</h3>
                                <p className="text-foreground/40 font-black uppercase tracking-widest text-[9px] leading-relaxed">Intercept feedback patterns and tester transmissions from the Alpha field.</p>
                            </div>
                            <Link href="/dashboard/admin/signals" className="mt-8">
                                <button className="w-full py-4 bg-[#39FF14] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#39FF14]/10 flex items-center justify-center gap-2">
                                    <span>Open Uplink</span>
                                    <Radio className="w-4 h-4" />
                                </button>
                            </Link>
                        </motion.div>

                        {/* 4. Users Directory */}
                        <motion.div 
                            variants={cardVariants}
                            className="p-8 bg-surface border border-surface-border rounded-[2.5rem] relative overflow-hidden group flex flex-col justify-between min-h-[300px]"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                            <div>
                                <div className="text-4xl mb-6">👥</div>
                                <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Entity Database</h3>
                                <p className="text-foreground/40 font-black uppercase tracking-widest text-[9px] leading-relaxed">Global Identity Registry. Access contact details and clearance levels.</p>
                            </div>
                            <Link href="/dashboard/admin/users" className="mt-8">
                                <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2">
                                    <span>View Registry</span>
                                    <UserCheck className="w-4 h-4" />
                                </button>
                            </Link>
                        </motion.div>

                        {/* 5. Comms Uplink */}
                        <motion.div 
                            variants={cardVariants}
                            className="p-8 bg-surface border border-surface-border rounded-[2.5rem] relative overflow-hidden group flex flex-col justify-between min-h-[300px] md:col-span-2 xl:col-span-2"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            <div className="relative z-10">
                                <div className="text-4xl mb-6">📨</div>
                                <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Comms Uplink</h3>
                                <p className="text-foreground/40 font-black uppercase tracking-widest text-[9px] leading-relaxed max-w-xl">SMS Broadcast Terminal. Send direct beams or mass waves to system entities.</p>
                            </div>
                            <Link href="/dashboard/admin/communication" className="mt-8">
                                <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2">
                                    <span>Initialize Broadcast</span>
                                    <Send className="w-4 h-4" />
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
