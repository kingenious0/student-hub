'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sliders, 
  Database, 
  FileSpreadsheet, 
  ShieldAlert, 
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Coins,
  Cpu,
  Key
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SystemControlsPage() {
    const [config, setConfig] = useState({
        deliveryFee: 5.0,
        platformFee: 2.0,
        maintenanceMode: false,
        paystackMode: 'TEST',
        paystackTestSecretKey: '',
        paystackTestPublicKey: '',
        paystackLiveSecretKey: '',
        paystackLivePublicKey: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [resetting, setResetting] = useState(false);
    const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
    const [paystackBalance, setPaystackBalance] = useState<number>(0);
    const [totalPendingAmount, setTotalPendingAmount] = useState<number>(0);
    const [shortfall, setShortfall] = useState<number>(0);
    const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

    const fetchPendingPayouts = async () => {
        try {
            const res = await fetch('/api/admin/payouts');
            const data = await res.json();
            if (data.success) {
                setPendingPayouts(data.payouts || []);
                setPaystackBalance(data.paystackBalance ?? 0);
                setTotalPendingAmount(data.totalPendingAmount ?? 0);
                setShortfall(data.shortfall ?? 0);
            }
        } catch (error) {
            console.error('Failed to fetch pending payouts');
        }
    };

    const handlePayoutAction = async (payoutId: string, action: 'RETRY' | 'FORCE_APPROVE' | 'REJECT') => {
        let confirmMsg = '';
        if (action === 'RETRY') confirmMsg = 'Retry executing this payout instantly via Paystack transfer API?';
        if (action === 'FORCE_APPROVE') confirmMsg = 'Force approve this payout request? Choose this if you have manually sent Mobile Money to the vendor yourself.';
        if (action === 'REJECT') confirmMsg = 'Reject this payout request and refund the vendor\'s balance?';

        const confirmed = confirm(confirmMsg);
        if (!confirmed) return;

        setProcessingPayoutId(payoutId);

        try {
            const res = await fetch('/api/admin/payouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payoutId, action })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                alert(`🎉 SUCCESS: Payout request resolved!`);
                fetchPendingPayouts(); // refresh list
            } else {
                alert(`❌ FAILURE: ${data.error || 'Server error'} - ${data.details || ''}`);
            }
        } catch (error) {
            alert('❌ CONNECTION ERROR: Could not process payout action.');
        } finally {
            setProcessingPayoutId(null);
        }
    };

    const handleCleanSlate = async () => {
        const confirmed = confirm(
            "⚠️ DESTRUCTIVE ACTION WARNING! ⚠️\n\nAre you absolutely sure you want to delete all order transactions, payouts, and reset all student/vendor balances to ₵0.00?\n\nThis will completely purge all test data so you can launch with a clean live ledger. This action CANNOT be undone!"
        );
        if (!confirmed) return;

        setResetting(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/clean-slate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (res.ok && data.success) {
                alert("🎉 SUCCESS: Ledgers purged! All user and vendor balances have been reset to ₵0.00.");
                setMessage('DATABASE RESET TO PRODUCTION CLEAN SLATE');
                setTimeout(() => setMessage(''), 5000);
            } else {
                alert(`❌ FAILURE: ${data.error || 'Server error'}`);
            }
        } catch (error) {
            alert("❌ COMMUNICATION ERROR: Could not trigger production reset.");
        } finally {
            setResetting(false);
        }
    };

    useEffect(() => {
        fetchConfig();
        fetchPendingPayouts();
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
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
                className="max-w-4xl mx-auto space-y-12 pt-20"
            >
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
                        </Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">SYSTEM CONTROLS</h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Global Variable Manipulation</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* SECTION 1: GLOBAL MARKET CONFIGURATION */}
                    <motion.div 
                        variants={cardVariants}
                        className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-8"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-teal-500" />
                        <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                        
                        <div className="border-b border-dashed border-surface-border/60 pb-6">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-primary" /> Market Parameters
                            </h2>
                            <p className="text-foreground/30 text-[9px] font-black uppercase tracking-widest mt-1">Configure global transaction overrides</p>
                        </div>

                        <div className="space-y-6">
                            {/* Delivery Fee */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-dashed border-surface-border/60">
                                <div>
                                    <h3 className="text-base font-black text-foreground uppercase tracking-tight">Mission Delivery Fee</h3>
                                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest leading-relaxed mt-1">Default payment for Shadow Runners per transit.</p>
                                </div>
                                <div className="flex items-center bg-background border-2 border-surface-border rounded-2xl px-5 py-3 self-end sm:self-auto min-w-[150px]">
                                    <span className="text-primary font-black mr-3">₵</span>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={isNaN(config.deliveryFee) ? '' : config.deliveryFee}
                                        onChange={(e) => setConfig({ ...config, deliveryFee: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                        className="bg-transparent text-foreground font-black text-xl w-full outline-none tracking-tighter"
                                    />
                                </div>
                            </div>

                            {/* Platform Fee */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-dashed border-surface-border/60">
                                <div>
                                    <h3 className="text-base font-black text-foreground uppercase tracking-tight">Access Royalty (Fee)</h3>
                                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest leading-relaxed mt-1">Platform service charge per acquisition.</p>
                                </div>
                                <div className="flex items-center bg-background border-2 border-surface-border rounded-2xl px-5 py-3 self-end sm:self-auto min-w-[150px]">
                                    <span className="text-primary font-black mr-3">₵</span>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={isNaN(config.platformFee) ? '' : config.platformFee}
                                        onChange={(e) => setConfig({ ...config, platformFee: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                        className="bg-transparent text-foreground font-black text-xl w-full outline-none tracking-tighter"
                                    />
                                </div>
                            </div>

                            {/* Maintenance Mode */}
                            <div className="flex items-center justify-between gap-4 py-4">
                                <div>
                                    <h3 className="text-base font-black text-foreground uppercase tracking-tight">Sector Lockdown</h3>
                                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest leading-relaxed mt-1">Suspend all marketplace activities for maintenance.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                                    className={cn(
                                        "w-16 h-8 rounded-full p-1 transition-all shrink-0 cursor-pointer",
                                        config.maintenanceMode ? 'bg-red-500' : 'bg-foreground/10'
                                    )}
                                >
                                    <motion.div
                                        animate={{ x: config.maintenanceMode ? 32 : 0 }}
                                        className="w-6 h-6 bg-white rounded-full shadow-md"
                                    />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* SECTION 2: PENDING PAYOUTS AUDIT PANEL */}
                    <motion.div 
                        variants={cardVariants}
                        className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-8"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
                        <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                        
                        <div className="border-b border-dashed border-surface-border/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-amber-500" /> Payouts Audit
                                </h2>
                                <p className="text-foreground/30 text-[9px] font-black uppercase tracking-widest mt-1">Manage pending vendor withdrawals</p>
                            </div>
                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest self-start sm:self-auto animate-pulse">
                                Required: {pendingPayouts.length} Action(s)
                            </span>
                        </div>

                        {/* Financial Ledger Balance Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-foreground/[0.02] rounded-2xl border border-surface-border">
                                <p className="text-[9px] font-black uppercase tracking-wider text-foreground/30">Paystack Balance</p>
                                <p className={cn("text-2xl font-black mt-1 font-mono tracking-tighter", paystackBalance >= totalPendingAmount ? 'text-emerald-500' : 'text-yellow-500')}>
                                    ₵{paystackBalance.toFixed(2)}
                                </p>
                            </div>
                            <div className="p-4 bg-foreground/[0.02] rounded-2xl border border-surface-border">
                                <p className="text-[9px] font-black uppercase tracking-wider text-foreground/30">Total Pending Payouts</p>
                                <p className="text-2xl font-black mt-1 text-foreground font-mono tracking-tighter">₵{totalPendingAmount.toFixed(2)}</p>
                            </div>
                            <div className={cn("p-4 rounded-2xl border transition-colors", shortfall > 0 ? 'bg-red-500/5 border-red-500/25' : 'bg-foreground/[0.02] border-surface-border')}>
                                <p className="text-[9px] font-black uppercase tracking-wider text-foreground/30">Shortfall to Fund</p>
                                <p className={cn("text-2xl font-black mt-1 font-mono tracking-tighter", shortfall > 0 ? 'text-red-500' : 'text-emerald-500')}>
                                    {shortfall > 0 ? `₵${shortfall.toFixed(2)}` : 'None'}
                                </p>
                            </div>
                        </div>

                        {pendingPayouts.length === 0 ? (
                            <div className="text-center py-12 space-y-3 bg-foreground/[0.02] rounded-3xl border border-dashed border-surface-border">
                                <div className="text-4xl">🛡</div>
                                <p className="text-xs font-black uppercase tracking-widest text-foreground/60">Pristine Financial Ledger</p>
                                <p className="text-[9px] text-foreground/30 font-black uppercase tracking-wider">No pending vendor withdrawals requiring manual intervention.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingPayouts.map((payout) => (
                                    <div key={payout.id} className="p-5 bg-foreground/[0.02] border border-surface-border rounded-3xl relative overflow-hidden space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-black text-foreground uppercase tracking-tight">
                                                    {payout.vendor?.shopName || payout.vendor?.name || 'Unknown Vendor'}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-foreground/40 mt-1 uppercase tracking-wider">
                                                    <span>ID: #{payout.id.slice(0, 8)}</span>
                                                    <span>•</span>
                                                    <span>{payout.network}: {payout.momoNumber}</span>
                                                </div>
                                                {payout.notes && (
                                                    <p className="text-[9px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider mt-2.5 inline-block">
                                                        ⚠ {payout.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-left sm:text-right shrink-0">
                                                <span className="text-2xl font-black font-mono tracking-tighter text-foreground">₵{payout.amount.toFixed(2)}</span>
                                                <p className="text-[9px] text-foreground/30 font-mono mt-0.5">{new Date(payout.createdAt).toLocaleString('en-GB')}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed border-surface-border/60">
                                            <button
                                                type="button"
                                                disabled={processingPayoutId !== null}
                                                onClick={() => handlePayoutAction(payout.id, 'RETRY')}
                                                className="px-4 py-2.5 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-primary/10"
                                            >
                                                {processingPayoutId === payout.id ? 'PROCESSING...' : 'RETRY PAYOUT'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={processingPayoutId !== null}
                                                onClick={() => handlePayoutAction(payout.id, 'FORCE_APPROVE')}
                                                className="px-4 py-2.5 bg-foreground/[0.04] border border-surface-border text-foreground font-black text-[9px] uppercase tracking-widest rounded-xl transition-all hover:bg-foreground/[0.08]"
                                            >
                                                FORCE MARK PAID
                                            </button>
                                            <button
                                                type="button"
                                                disabled={processingPayoutId !== null}
                                                onClick={() => handlePayoutAction(payout.id, 'REJECT')}
                                                className="px-4 py-2.5 bg-red-500/10 border border-red-500/25 text-red-500 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all hover:bg-red-500 hover:text-white"
                                            >
                                                REJECT & REFUND
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* SECTION 3: INFRASTRUCTURE PROTOCOL & BACKUPS */}
                    <motion.div 
                        variants={cardVariants}
                        className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-8"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
                        <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                        
                        <div className="border-b border-dashed border-surface-border/60 pb-6">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-500" /> System Infrastructure
                            </h2>
                            <p className="text-foreground/30 text-[9px] font-black uppercase tracking-widest mt-1">Database state and system data backup controls</p>
                        </div>

                        <div className="space-y-6">
                            {/* Database Connectivity */}
                            <div className="flex items-center justify-between gap-4 py-4 border-b border-dashed border-surface-border/60">
                                <div>
                                    <h3 className="text-base font-black text-foreground uppercase tracking-tight">Database Connectivity</h3>
                                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest leading-relaxed mt-1">Real-time link status to CockroachDB Core.</p>
                                </div>
                                <div className="flex items-center gap-3 bg-foreground/[0.02] border border-surface-border px-4 py-2 rounded-xl">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                                        {loading ? 'PENDING...' : 'ONLINE • STABLE'}
                                    </span>
                                    <div className={cn("w-3.5 h-3.5 rounded-full shrink-0", loading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]')} />
                                </div>
                            </div>

                            {/* CSV Exports */}
                            <div className="space-y-4 pt-2">
                                <div>
                                    <h3 className="text-base font-black text-foreground uppercase tracking-tight">Intelligence Export (CSV)</h3>
                                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest leading-relaxed mt-1">Select sector to generate spreadsheet-ready data snapshot.</p>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { label: 'Users', table: 'users' },
                                        { label: 'Products', table: 'products' },
                                        { label: 'Orders', table: 'orders' }
                                    ].map((item, idx) => (
                                        <Link key={idx} href={`/api/admin/backup?table=${item.table}&format=csv`} target="_blank" className="w-full">
                                            <button type="button" className="w-full py-3 bg-foreground/[0.02] border border-surface-border rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-sm">
                                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                                <span>{item.label}</span>
                                            </button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* SECTION 4: PAYSTACK GATEWAY SETTINGS */}
                    <motion.div 
                        variants={cardVariants}
                        className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-8"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />
                        <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                        
                        <div className="border-b border-dashed border-surface-border/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-red-500" /> Paystack Gateway
                                </h2>
                                <p className="text-foreground/30 text-[9px] font-black uppercase tracking-widest mt-1">Configure live and sandbox transaction keys</p>
                            </div>
                            <span className={cn(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border self-start sm:self-auto",
                                config.paystackMode === 'LIVE' 
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                    : 'bg-primary/10 border-primary/20 text-primary'
                            )}>
                                {config.paystackMode === 'LIVE' ? '🔴 Live Mode Active' : '🟡 Test Mode Active'}
                            </span>
                        </div>

                        <div className="space-y-6">
                            {/* Environment Selector Toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-dashed border-surface-border/60">
                                <div>
                                    <h3 className="text-base font-black text-foreground uppercase tracking-tight">Transaction Mode</h3>
                                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest leading-relaxed mt-1">Switch immediately between simulating payments and processing real money.</p>
                                </div>
                                <div className="flex bg-background border border-surface-border rounded-xl p-1 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, paystackMode: 'TEST' })}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                            config.paystackMode === 'TEST' ? 'bg-primary text-black shadow-md' : 'text-foreground/50 hover:text-foreground'
                                        )}
                                    >
                                        Test Mode
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, paystackMode: 'LIVE' })}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                            config.paystackMode === 'LIVE' ? 'bg-red-600 text-white shadow-md' : 'text-foreground/50 hover:text-foreground'
                                        )}
                                    >
                                        Live Mode
                                    </button>
                                </div>
                            </div>

                            {/* API Keys configuration layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {/* Test Keys */}
                                <div className="p-5 bg-foreground/[0.02] rounded-3xl border border-surface-border space-y-4">
                                    <h4 className="text-xs font-black uppercase text-foreground/40 tracking-wider flex items-center gap-1.5">
                                        <Key className="w-3.5 h-3.5 text-primary" /> Test Environment
                                    </h4>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Test Public Key</label>
                                        <input
                                            type="text"
                                            value={config.paystackTestPublicKey || ''}
                                            onChange={(e) => setConfig({ ...config, paystackTestPublicKey: e.target.value })}
                                            placeholder="pk_test_..."
                                            className="w-full bg-background border-2 border-surface-border rounded-xl p-3 font-bold text-xs outline-none focus:border-primary text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Test Secret Key</label>
                                        <input
                                            type="password"
                                            value={config.paystackTestSecretKey || ''}
                                            onChange={(e) => setConfig({ ...config, paystackTestSecretKey: e.target.value })}
                                            placeholder="sk_test_..."
                                            className="w-full bg-background border-2 border-surface-border rounded-xl p-3 font-bold text-xs outline-none focus:border-primary text-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Live Keys */}
                                <div className="p-5 bg-foreground/[0.02] rounded-3xl border border-surface-border space-y-4">
                                    <h4 className="text-xs font-black uppercase text-red-500/75 tracking-wider flex items-center gap-1.5">
                                        <Key className="w-3.5 h-3.5 text-red-500" /> Live Environment
                                    </h4>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Live Public Key</label>
                                        <input
                                            type="text"
                                            value={config.paystackLivePublicKey || ''}
                                            onChange={(e) => setConfig({ ...config, paystackLivePublicKey: e.target.value })}
                                            placeholder="pk_live_..."
                                            className="w-full bg-background border-2 border-surface-border rounded-xl p-3 font-bold text-xs outline-none focus:border-red-500 text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Live Secret Key</label>
                                        <input
                                            type="password"
                                            value={config.paystackLiveSecretKey || ''}
                                            onChange={(e) => setConfig({ ...config, paystackLiveSecretKey: e.target.value })}
                                            placeholder="sk_live_..."
                                            className="w-full bg-background border-2 border-surface-border rounded-xl p-3 font-bold text-xs outline-none focus:border-red-500 text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* SECTION 5: DESTRUCTIVE CONTROLS */}
                    <motion.div 
                        variants={cardVariants}
                        className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-6"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-700 to-orange-600" />
                        <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                        
                        <div className="border-b border-dashed border-surface-border/60 pb-6">
                            <h2 className="text-2xl font-black text-red-500 uppercase tracking-tight flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> Destructive Protocols
                            </h2>
                            <p className="text-foreground/30 text-[9px] font-black uppercase tracking-widest mt-1">Irreversible ledger cleanup procedures</p>
                        </div>

                        <div className="p-5 bg-red-950/15 border border-red-500/20 rounded-3xl space-y-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white uppercase tracking-wider">
                                        PURGE DATA & RESET LEDGER
                                    </p>
                                    <p className="text-[10px] text-foreground/50 leading-relaxed font-mono font-medium lowercase">
                                        This action deletes all orders, transaction logs, dynamic configs, and resets user wallets/balances back to zero.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleCleanSlate}
                                disabled={resetting}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 cursor-pointer"
                            >
                                {resetting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        PURGING SYSTEM DATA...
                                    </>
                                ) : (
                                    "EXECUTE PRODUCTION RESET"
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Commit changes submission buttons */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-5 bg-primary text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {saving ? 'COMMITTING OVERRIDES...' : 'COMMIT SYSTEM OVERRIDES'}
                        </button>

                        {message && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("text-[10px] font-black uppercase tracking-widest", message.includes('FAILURE') || message.includes('PROTOCOL') ? 'text-red-500' : 'text-primary')}
                            >
                                {message}
                            </motion.p>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
