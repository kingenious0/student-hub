'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, Shield, Database, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Fetch users failed');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm)
    );

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
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
            transition: { type: "spring", stiffness: 100, damping: 15 } 
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto pt-20 space-y-12"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all">← Back to Command Center</Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">Entity/User Database</h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Global Identity Registry</p>
                    </div>
                    <div className="bg-surface border border-surface-border rounded-2xl px-5 py-2.5 flex items-center gap-2 relative overflow-hidden self-start md:self-auto">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{users.length} Records Active</span>
                    </div>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-surface-border rounded-2xl pl-11 pr-4 py-3.5 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-primary transition-colors text-foreground placeholder-foreground/30"
                        />
                    </div>
                </div>

                {/* Main Receipt-themed Table Container */}
                <motion.div 
                    variants={cardVariants}
                    className="bg-surface border border-surface-border rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                >
                    {/* Brand Top Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-primary" />
                    
                    {/* Dotted border overlay simulating receipt paper */}
                    <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />

                    <div className="overflow-x-auto p-6 sm:p-8">
                        <table className="w-full text-left font-bold text-xs uppercase tracking-tight">
                            <thead>
                                <tr className="text-foreground/30 border-b border-dashed border-surface-border/80">
                                    <th className="pb-4 pt-2 font-black tracking-widest text-[9px] uppercase text-foreground/40">Identity</th>
                                    <th className="pb-4 pt-2 font-black tracking-widest text-[9px] uppercase text-foreground/40">Clearance</th>
                                    <th className="pb-4 pt-2 font-black tracking-widest text-[9px] uppercase text-foreground/40">Contact (Phone)</th>
                                    <th className="pb-4 pt-2 font-black tracking-widest text-[9px] uppercase text-foreground/40">Status</th>
                                    <th className="pb-4 pt-2 font-black tracking-widest text-[9px] uppercase text-foreground/40">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed divide-surface-border/60">
                                <AnimatePresence>
                                    {filteredUsers.map(user => (
                                        <motion.tr 
                                            layout
                                            key={user.id} 
                                            className="hover:bg-foreground/[0.02] transition-colors"
                                        >
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-black font-black text-sm shrink-0">
                                                        {user.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-black text-sm text-foreground truncate tracking-tight">{user.name || 'Unknown Entity'}</div>
                                                        <div className="text-[10px] text-foreground/40 font-mono font-medium lowercase truncate select-all">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                                    user.role === 'ADMIN' 
                                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' 
                                                        : user.role === 'VENDOR' 
                                                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' 
                                                            : 'bg-primary/10 border-primary/20 text-primary'
                                                )}>
                                                    {user.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-2 text-xs font-mono font-medium text-foreground/80">
                                                    <Phone className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                                    {user.phoneNumber ? (
                                                        <span 
                                                            className="hover:text-primary transition-colors cursor-pointer select-all" 
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(user.phoneNumber);
                                                            }} 
                                                            title="Click to copy"
                                                        >
                                                            {user.phoneNumber}
                                                        </span>
                                                    ) : (
                                                        <span className="opacity-20">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <span className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">
                                                    {user.vendorStatus === 'NOT_APPLICABLE' ? 'Citizen' : user.vendorStatus}
                                                </span>
                                            </td>
                                            <td className="py-4 text-[10px] font-mono font-medium text-foreground/30">
                                                {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="p-16 text-center text-foreground/30 space-y-4">
                            <Database className="w-12 h-12 mx-auto opacity-35" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No matching records found in database.</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
