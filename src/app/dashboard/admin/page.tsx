
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
                        { label: 'Ecosystem Revenue', value: `₵${(stats?.totalRevenue || 0).toFixed(2)}`, icon: '💰' },
                        { label: 'Active Protocols', value: stats?.totalOrders || 0, icon: '📡' },
                        { label: 'Total Entities', value: stats?.totalUsers || 0, icon: '👤' },
                        { label: 'Pending Partners', value: stats?.pendingVendors || 0, icon: '🏪', color: 'text-yellow-400' },
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
                                        <td className="p-6 text-foreground">{order.items?.[0]?.product?.title || 'Unknown Item'}</td>
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
                {/* Command Modules */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* 1. Partner Vetting */}
                    <div className="p-10 bg-surface border border-surface-border rounded-[2.5rem] group cursor-pointer hover:border-primary/30 transition-all">
                        <div className="text-5xl mb-6">🛠️</div>
                        <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Partner Vetting</h3>
                        <p className="text-foreground/40 mb-6 max-w-sm font-black uppercase tracking-widest text-[9px]">Review, verify, and activate campus vendors to the OMNI Network.</p>
                        <Link href="/dashboard/admin/vetting">
                            <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all omni-glow active:scale-95">Enter Protocol</button>
                        </Link>
                    </div>

                    {/* 2. System Controls */}
                    <div className="p-10 bg-surface border border-surface-border rounded-[2.5rem] group cursor-pointer hover:border-primary/30 transition-all">
                        <div className="text-5xl mb-6">🎛️</div>
                        <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">System Controls</h3>
                        <p className="text-foreground/40 mb-6 max-w-sm font-black uppercase tracking-widest text-[9px]">Manage global settings, fee structure, backups, and security parameters.</p>
                        <Link href="/dashboard/admin/controls">
                            <button className="w-full py-4 bg-surface border-2 border-surface-border text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95">Access Terminal</button>
                        </Link>
                    </div>

                    {/* 3. Signal Intel */}
                    <div className="p-10 bg-surface border border-surface-border rounded-[2.5rem] group cursor-pointer hover:border-[#39FF14]/30 transition-all">
                        <div className="text-5xl mb-6">📡</div>
                        <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Signal Intel</h3>
                        <p className="text-foreground/40 mb-6 max-w-sm font-black uppercase tracking-widest text-[9px]">Intercept feedback patterns and tester transmissions from the Alpha field.</p>
                        <Link href="/dashboard/admin/signals">
                            <button className="w-full py-4 bg-[#39FF14] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg active:scale-95">Open Uplink</button>
                        </Link>
                    </div>

                    {/* 4. Users Directory */}
                    <div className="p-10 bg-surface border border-surface-border rounded-[2.5rem] group cursor-pointer hover:border-purple-500/30 transition-all">
                        <div className="text-5xl mb-6">👥</div>
                        <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Entity Database</h3>
                        <p className="text-foreground/40 mb-6 max-w-sm font-black uppercase tracking-widest text-[9px]">Global Identity Registry. Access contact details and clearance levels.</p>
                        <Link href="/dashboard/admin/users">
                            <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-95">View Registry</button>
                        </Link>
                    </div>

                    {/* 5. Comms Uplink */}
                    <div className="p-10 bg-surface border border-surface-border rounded-[2.5rem] group cursor-pointer hover:border-blue-500/30 transition-all md:col-span-2 xl:col-span-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="text-5xl mb-6">📨</div>
                                <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Comms Uplink</h3>
                                <p className="text-foreground/40 mb-6 max-w-md font-black uppercase tracking-widest text-[9px]">SMS Broadcast Terminal. Send direct beams or mass waves to system entities.</p>
                            </div>
                            <Link href="/dashboard/admin/communication">
                                <button className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 whitespace-nowrap">
                                    Initialize Broadcast →
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
