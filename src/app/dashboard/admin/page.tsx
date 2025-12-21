
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    product: {
        title: string;
    };
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

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">OMNI COMMAND</h1>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mt-2">System Analytics & Oversight</p>
                    </div>
                    <div className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg omni-glow">
                        Level: The Boss
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Ecosystem Revenue', value: `₵${stats?.totalRevenue.toFixed(2)}`, icon: '💰' },
                        { label: 'Active Protocols', value: stats?.totalOrders, icon: '📡' },
                        { label: 'Total Entities', value: stats?.totalUsers, icon: '👤' },
                        { label: 'Pending Partners', value: stats?.pendingVendors, icon: '🏪', color: 'text-yellow-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-surface border border-surface-border rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="text-4xl mb-4">{stat.icon}</div>
                            <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                            <div className={`text-3xl font-black tracking-tighter ${stat.color || 'text-foreground'}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Recent activity */}
                <div className="bg-surface border border-surface-border rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 border-b border-surface-border bg-foreground/5 flex items-center justify-between">
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight">System Feed</h2>
                        <button onClick={fetchAdminStats} className="text-primary text-[10px] font-black uppercase tracking-widest hover:brightness-125 transition-all">Refresh Logs 🔄</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold text-xs uppercase tracking-tight">
                            <thead>
                                <tr className="text-foreground/20 border-b border-surface-border">
                                    <th className="p-6">ID</th>
                                    <th className="p-6">ENTITY</th>
                                    <th className="p-6">COORDINATES</th>
                                    <th className="p-6">VALUE</th>
                                    <th className="p-6">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="text-foreground/50">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-surface-border hover:bg-foreground/5 transition-all">
                                        <td className="p-6 font-mono text-[10px] opacity-30">{order.id.slice(0, 8)}...</td>
                                        <td className="p-6 text-foreground">{order.product.title}</td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span>S: {order.student?.name || 'ANON'}</span>
                                                <span className="text-[10px] opacity-50">V: {order.vendor?.shopName || 'ANON'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-primary">₵{order.amount.toFixed(2)}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] border ${order.status === 'COMPLETED' ? 'border-primary/30 text-primary' : 'border-yellow-400/30 text-yellow-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Security Audit Log */}
                <div className="bg-surface border border-surface-border rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 border-b border-surface-border bg-red-500/5 flex items-center justify-between">
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                            <span className="text-red-500">🛡️</span> Security Audit Log
                        </h2>
                        <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">Tamper-Proof Trace</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold text-xs uppercase tracking-tight">
                            <thead>
                                <tr className="text-foreground/20 border-b border-surface-border">
                                    <th className="p-6">TIME</th>
                                    <th className="p-6">ACTION</th>
                                    <th className="p-6">ADMIN</th>
                                    <th className="p-6">DETAILS</th>
                                </tr>
                            </thead>
                            <tbody className="text-foreground/50">
                                {recentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-foreground/20 italic">No recent security events detected.</td>
                                    </tr>
                                ) : (
                                    recentLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-surface-border hover:bg-red-500/5 transition-all">
                                            <td className="p-6 font-mono text-[10px] opacity-30">
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-2 py-1 rounded-md text-[9px] ${log.action.includes('PARTNER') ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-6 text-foreground text-[10px] font-mono opacity-50">{log.adminId.slice(0, 12)}...</td>
                                            <td className="p-6 text-[10px] max-w-xs truncate">{log.details || 'N/A'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Partner Management Teaser */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-12 bg-surface border border-surface-border rounded-[3rem] group cursor-pointer hover:border-primary/30 transition-all">
                        <div className="text-6xl mb-8">🛠️</div>
                        <h3 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tighter">Partner Vetting</h3>
                        <p className="text-foreground/40 mb-8 max-w-sm font-black uppercase tracking-widest text-[10px]">Review, verify, and activate campus vendors to the OMNI Network.</p>
                        <Link href="/dashboard/admin/vetting">
                            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all omni-glow active:scale-95">Enter Protocol</button>
                        </Link>
                    </div>
                    <div className="p-12 bg-surface border border-surface-border rounded-[3rem] group cursor-pointer hover:border-primary/30 transition-all">
                        <div className="text-6xl mb-8">🎛️</div>
                        <h3 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tighter">System Controls</h3>
                        <p className="text-foreground/40 mb-8 max-w-sm font-black uppercase tracking-widest text-[10px]">Manage global settings, fee structure, and security parameters.</p>
                        <Link href="/dashboard/admin/controls">
                            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all omni-glow active:scale-95">Access Terminal</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
