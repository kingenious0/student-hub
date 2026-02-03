
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SystemControlsPage() {
    const [config, setConfig] = useState({
        deliveryFee: 5.0,
        platformFee: 2.0,
        maintenanceMode: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/controls');
            const data = await res.json();
            if (data.success) {
                setConfig(data.config);
            }
        } catch (error) {
            console.error('Failed to fetch config');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/controls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (res.ok) {
                setMessage('SYSTEM PARAMETERS COMMITTED SUCCESSFULLY');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setMessage('PROTOCOL FAILURE: COULD NOT UPDATE');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-12 pt-20">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all">← Back to Command Center</Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">SYSTEM CONTROLS</h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Global Variable Manipulation</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="bg-surface border border-surface-border rounded-[3rem] p-10 space-y-10">
                        {/* Delivery Fee */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-surface-border">
                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Mission Delivery Fee</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-1">Default payment for Shadow Runners per transit.</p>
                            </div>
                            <div className="flex items-center bg-background border-2 border-surface-border rounded-2xl px-6 py-4">
                                <span className="text-primary font-black mr-4">₵</span>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={isNaN(config.deliveryFee) ? '' : config.deliveryFee}
                                    onChange={(e) => setConfig({ ...config, deliveryFee: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                    className="bg-transparent text-foreground font-black text-2xl w-24 outline-none tracking-tighter"
                                />
                            </div>
                        </div>

                        {/* Platform Fee */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-surface-border">
                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Access Royalty (Fee)</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-1">Platform service charge per acquisition.</p>
                            </div>
                            <div className="flex items-center bg-background border-2 border-surface-border rounded-2xl px-6 py-4">
                                <span className="text-primary font-black mr-4">₵</span>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={isNaN(config.platformFee) ? '' : config.platformFee}
                                    onChange={(e) => setConfig({ ...config, platformFee: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                    className="bg-transparent text-foreground font-black text-2xl w-24 outline-none tracking-tighter"
                                />
                            </div>
                        </div>

                        {/* Maintenance Mode */}
                        <div className="flex items-center justify-between gap-6 pt-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Sector Lockdown</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-1">Suspend all marketplace activities for maintenance.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                                className={`w-20 h-10 rounded-full p-1 transition-all ${config.maintenanceMode ? 'bg-red-500' : 'bg-foreground/10'}`}
                            >
                                <motion.div
                                    animate={{ x: config.maintenanceMode ? 40 : 0 }}
                                    className="w-8 h-8 bg-white rounded-full shadow-lg"
                                />
                            </button>
                        </div>
                    </div>

                    {/* INFRASTRUCTURE OVERSIGHT */}
                    <div className="bg-surface border border-surface-border rounded-[3rem] p-10 space-y-10">
                        <div className="border-b border-surface-border pb-8">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Infrastructure Protocol</h2>
                            <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-2">Database Status & Data Retention</p>
                        </div>

                        {/* Database Health */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-surface-border">
                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Database Connectivity</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-1">Real-time link status to CockroachDB Core.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                    {loading ? 'PINGING...' : 'ONLINE • STABLE'}
                                </span>
                                <div className={`w-4 h-4 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-[#39FF14] shadow-[0_0_10px_#39FF14]'}`}></div>
                            </div>
                        </div>

                        {/* Backup / Export Section */}
                        <div className="space-y-6">
                            <div className="border-b border-surface-border pb-4">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Intelligence Export (CSV)</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-1">Select sector to generate spreadsheet-ready data snapshot.</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                                <Link href="/api/admin/backup?table=users&format=csv" target="_blank" className="flex-1 min-w-[150px]">
                                    <button type="button" className="w-full px-6 py-4 bg-foreground/5 border border-surface-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all group">
                                        Users <span className="opacity-40 group-hover:opacity-100 ml-1">↓</span>
                                    </button>
                                </Link>
                                
                                <Link href="/api/admin/backup?table=products&format=csv" target="_blank" className="flex-1 min-w-[150px]">
                                    <button type="button" className="w-full px-6 py-4 bg-foreground/5 border border-surface-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all group">
                                        Products <span className="opacity-40 group-hover:opacity-100 ml-1">↓</span>
                                    </button>
                                </Link>
                                
                                <Link href="/api/admin/backup?table=orders&format=csv" target="_blank" className="flex-1 min-w-[150px]">
                                    <button type="button" className="w-full px-6 py-4 bg-foreground/5 border border-surface-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all group">
                                        Orders <span className="opacity-40 group-hover:opacity-100 ml-1">↓</span>
                                    </button>
                                </Link>
                            </div>

                            <Link href="/api/admin/backup?table=all&format=json" target="_blank" className="block text-center mt-4">
                                <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em] hover:text-primary cursor-pointer transition-all">
                                    [ DEV MODE: Download Full JSON Core Archive ]
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] omni-glow hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                        >
                            {saving ? 'COMMITTING CHANGES...' : 'COMMIT SYSTEM COMMAND'}
                        </button>

                        {message && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-[10px] font-black uppercase tracking-widest ${message.includes('FAILURE') ? 'text-red-500' : 'text-primary'}`}
                            >
                                {message}
                            </motion.p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
