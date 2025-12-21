
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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

    return (
        <div className="min-h-screen bg-background p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-12 pt-20">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all">← Back to Command Center</Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">PARTNER VETTING</h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Uplink Security Clearance Loop</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="bg-surface border border-surface-border rounded-[3rem] p-24 text-center">
                        <div className="text-6xl mb-6 opacity-20">📡</div>
                        <p className="text-foreground/20 font-black uppercase tracking-widest">No pending partner requests detected in the sector.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {vendors.map((vendor) => (
                                <motion.div
                                    key={vendor.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-surface border border-surface-border rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-primary/20 transition-all relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center text-3xl">🏪</div>
                                        <div>
                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">{vendor.shopName}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">📍 {vendor.shopLandmark}</span>
                                                <span className="h-1 w-1 bg-foreground/20 rounded-full"></span>
                                                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest leading-none">👤 {vendor.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 relative z-10">
                                        <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleAction(vendor.id, 'REJECT')}
                                            className="px-8 py-4 border-2 border-red-500/20 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
                                        >
                                            Deny
                                        </button>
                                        <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleAction(vendor.id, 'APPROVE')}
                                            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] omni-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                                        >
                                            {actionLoading === vendor.id ? 'PENDING...' : 'Authorize Partner'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
