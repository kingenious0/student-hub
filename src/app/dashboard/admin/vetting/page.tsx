'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, User, MapPin, Check, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface VendorItem {
    id: string;
    shopName: string;
    shopLandmark: string;
    name: string;
}

export default function PartnerVettingPage() {
    const [vendors, setVendors] = useState<VendorItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/admin/vetting');
            const data = await res.json();
            if (data.success) {
                setVendors(data.vendors);
            }
        } catch (error) {
            console.error('Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (vendorId: string, action: 'APPROVE' | 'REJECT') => {
        setActionLoading(vendorId);
        try {
            const res = await fetch('/api/admin/vetting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendorId, action })
            });

            if (res.ok) {
                setVendors(prev => prev.filter(v => v.id !== vendorId));
            }
        } catch (error) {
            console.error('Action failed');
        } finally {
            setActionLoading(null);
        }
    };

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
                className="max-w-4xl mx-auto pt-20 space-y-12"
            >
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
                        </Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">PARTNER VETTING</h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Uplink Security Clearance Loop</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : vendors.length === 0 ? (
                    <motion.div 
                        variants={cardVariants}
                        className="bg-surface border border-surface-border rounded-[2.5rem] p-16 sm:p-24 text-center shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/50 to-primary/10" />
                        <div className="text-6xl mb-6 opacity-30">📡</div>
                        <p className="text-foreground/20 font-black uppercase tracking-widest text-xs">No pending partner requests detected in the sector.</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-8">
                        <AnimatePresence>
                            {vendors.map((vendor) => (
                                <motion.div
                                    key={vendor.id}
                                    layout
                                    variants={cardVariants}
                                    className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group shadow-2xl"
                                >
                                    {/* Accent brand top line */}
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-primary to-emerald-500" />
                                    
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 bg-foreground/[0.04] border border-surface-border rounded-2xl flex items-center justify-center text-2xl shrink-0 mt-0.5">
                                                🏪
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter truncate">{vendor.shopName}</h3>
                                                
                                                {/* Details wrapper simulating receipt items */}
                                                <div className="bg-foreground/[0.02] border border-surface-border rounded-2xl p-4 mt-3 space-y-2 text-xs font-bold uppercase tracking-wider text-foreground/60 max-w-md">
                                                    <div className="flex justify-between border-b border-dashed border-surface-border/60 pb-2">
                                                        <span className="text-foreground/30 text-[9px] font-black tracking-widest flex items-center gap-1.5">
                                                            <MapPin className="w-3.5 h-3.5 text-primary" /> Landmark
                                                        </span>
                                                        <span className="text-foreground font-black">{vendor.shopLandmark}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-foreground/30 text-[9px] font-black tracking-widest flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-primary" /> Owner Name
                                                        </span>
                                                        <span className="text-foreground font-black">{vendor.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
                                            <button
                                                disabled={!!actionLoading}
                                                onClick={() => handleAction(vendor.id, 'REJECT')}
                                                className="px-6 py-4 border-2 border-red-500/20 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                <span>Deny</span>
                                            </button>
                                            <button
                                                disabled={!!actionLoading}
                                                onClick={() => handleAction(vendor.id, 'APPROVE')}
                                                className="px-6 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/10 flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                <span>{actionLoading === vendor.id ? 'PENDING...' : 'Authorize Partner'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
