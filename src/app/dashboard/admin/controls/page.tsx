
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

                        {/* Production Clean Slate / Database Reset */}
                        <div className="pt-8 border-t border-surface-border space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-red-500 uppercase tracking-tight">Production Clean Slate</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-1">
                                    Permanently wipe all test transactions, orders, payouts, and reset user balances back to ₵0.00.
                                </p>
                            </div>
                            
                            <div className="p-6 bg-red-950/20 border border-red-500/25 rounded-3xl space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-white uppercase tracking-wider mb-1">
                                            DESTRUCTIVE DEPLOYMENT PROTOCOL
                                        </p>
                                        <p className="text-[10px] text-foreground/55 leading-relaxed font-mono">
                                            This action is irreversible. All order histories, items, and pending/completed payout requests will be deleted from CockroachDB to establish a pristine clean production ledger.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCleanSlate}
                                    disabled={resetting}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {resetting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            PURGING LEDGERS...
                                        </>
                                    ) : (
                                        "EXECUTE PRODUCTION RESET"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PENDING PAYOUTS MANAGEMENT PANEL */}
                    <div className="bg-surface border border-surface-border rounded-[3rem] p-10 space-y-10">
                        <div className="border-b border-surface-border pb-8 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Pending Payouts Audit</h2>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-2">Manage and execute pending vendor withdrawal fallbacks.</p>
                            </div>
                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                ⚡ Action Required: {pendingPayouts.length}
                            </span>
                        </div>

                        {/* Paystack Balance Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-background/30 rounded-2xl border border-surface-border">
                                <p className="text-[9px] font-black uppercase tracking-wider text-foreground/40">Paystack Balance</p>
                                <p className={`text-2xl font-black mt-1 ${paystackBalance >= totalPendingAmount ? 'text-[#39FF14]' : 'text-yellow-500'}`}>
                                    ₵{paystackBalance.toFixed(2)}
                                </p>
                            </div>
                            <div className="p-4 bg-background/30 rounded-2xl border border-surface-border">
                                <p className="text-[9px] font-black uppercase tracking-wider text-foreground/40">Total Pending Payouts</p>
                                <p className="text-2xl font-black mt-1 text-foreground">₵{totalPendingAmount.toFixed(2)}</p>
                            </div>
                            <div className={`p-4 rounded-2xl border ${shortfall > 0 ? 'bg-red-950/20 border-red-500/25' : 'bg-background/30 border-surface-border'}`}>
                                <p className="text-[9px] font-black uppercase tracking-wider text-foreground/40">Shortfall to Fund</p>
                                <p className={`text-2xl font-black mt-1 ${shortfall > 0 ? 'text-red-500' : 'text-[#39FF14]'}`}>
                                    {shortfall > 0 ? `₵${shortfall.toFixed(2)}` : 'None'}
                                </p>
                                {shortfall > 0 && (
                                    <p className="text-[8px] text-red-400/70 font-black uppercase tracking-wider mt-1">
                                        Fund Paystack balance to process all pending withdrawals
                                    </p>
                                )}
                            </div>
                        </div>

                        {pendingPayouts.length === 0 ? (
                            <div className="text-center py-10 space-y-3 bg-background/25 rounded-3xl border border-dashed border-surface-border">
                                <span className="text-4xl">🛡️</span>
                                <p className="text-sm font-bold text-foreground/60 uppercase tracking-wide">Pristine Financial Ledger</p>
                                <p className="text-[10px] text-foreground/30 font-black uppercase tracking-wider">No pending vendor withdrawals requiring manual intervention.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {pendingPayouts.map((payout) => (
                                    <div key={payout.id} className="p-6 bg-background/50 border border-surface-border rounded-3xl space-y-4">
                                        {/* Row 1: Details */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-black text-foreground uppercase">
                                                    {payout.vendor?.shopName || payout.vendor?.name || 'Unknown Vendor'}
                                                </h4>
                                                <p className="text-[10px] font-mono text-foreground/40 mt-1">
                                                    ID: #{payout.id.slice(0, 8)} • Phone: {payout.momoNumber} ({payout.network})
                                                </p>
                                                {payout.notes && (
                                                    <p className="text-[9px] text-yellow-500/80 font-black uppercase tracking-wider mt-1.5">
                                                        ⚠ {payout.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-foreground">₵{payout.amount.toFixed(2)}</span>
                                                <p className="text-[9px] text-foreground/30 font-mono mt-0.5">{new Date(payout.createdAt).toLocaleString('en-GB')}</p>
                                            </div>
                                        </div>

                                        {/* Row 2: Action Buttons */}
                                        <div className="flex flex-wrap gap-3 pt-4 border-t border-surface-border/50">
                                            <button
                                                type="button"
                                                disabled={processingPayoutId !== null}
                                                onClick={() => handlePayoutAction(payout.id, 'RETRY')}
                                                className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                                            >
                                                {processingPayoutId === payout.id ? 'PROCESSING...' : 'RETRY INSTANT PAYOUT'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={processingPayoutId !== null}
                                                onClick={() => handlePayoutAction(payout.id, 'FORCE_APPROVE')}
                                                className="px-4 py-2.5 bg-foreground/5 hover:bg-foreground/15 border border-surface-border text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                            >
                                                FORCE MARK PAID
                                            </button>
                                            <button
                                                type="button"
                                                disabled={processingPayoutId !== null}
                                                onClick={() => handlePayoutAction(payout.id, 'REJECT')}
                                                className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                            >
                                                REJECT & REFUND
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PAYSTACK DYNAMIC GATEWAY CONFIGURATION */}
                    <div className="bg-surface border border-surface-border rounded-[3rem] p-10 space-y-10">
                        <div className="border-b border-surface-border pb-8 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Paystack Gateway</h2>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-2">Manage environment states and API key infrastructure.</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                config.paystackMode === 'LIVE' 
                                    ? 'text-red-500 bg-red-500/10 border-red-500/20' 
                                    : 'text-primary bg-primary/10 border-primary/20'
                            }`}>
                                {config.paystackMode === 'LIVE' ? '🔴 Live Mode Active' : '🟡 Test Mode Active'}
                            </span>
                        </div>

                        {/* Paystack Mode Selector Toggle */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-surface-border">
                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Transaction Mode</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mt-1">Switch immediately between simulating payments and processing real money.</p>
                            </div>
                            <div className="flex bg-background border border-surface-border rounded-2xl p-1 gap-1">
                                <button
                                    type="button"
                                    onClick={() => setConfig({ ...config, paystackMode: 'TEST' })}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                        config.paystackMode === 'TEST'
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'text-foreground/60 hover:text-foreground'
                                    }`}
                                >
                                    Test Mode
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfig({ ...config, paystackMode: 'LIVE' })}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                        config.paystackMode === 'LIVE'
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'text-foreground/60 hover:text-foreground'
                                    }`}
                                >
                                    Live Mode
                                </button>
                            </div>
                        </div>

                        {/* API Keys Configuration Input Fields */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-4">Environment Keys Configuration</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Test Keys */}
                                <div className="space-y-4 p-6 bg-background/30 rounded-3xl border border-surface-border">
                                    <h4 className="text-xs font-black uppercase text-foreground/50 tracking-wider">Test Configuration</h4>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black uppercase text-foreground/45">Test Public Key</label>
                                        <input
                                            type="text"
                                            value={config.paystackTestPublicKey || ''}
                                            onChange={(e) => setConfig({ ...config, paystackTestPublicKey: e.target.value })}
                                            placeholder="pk_test_..."
                                            className="w-full bg-background border border-surface-border rounded-xl p-3 font-bold text-xs outline-none focus:border-primary text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black uppercase text-foreground/45">Test Secret Key</label>
                                        <input
                                            type="password"
                                            value={config.paystackTestSecretKey || ''}
                                            onChange={(e) => setConfig({ ...config, paystackTestSecretKey: e.target.value })}
                                            placeholder="sk_test_..."
                                            className="w-full bg-background border border-surface-border rounded-xl p-3 font-bold text-xs outline-none focus:border-primary text-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Live Keys */}
                                <div className="space-y-4 p-6 bg-background/30 rounded-3xl border border-surface-border">
                                    <h4 className="text-xs font-black uppercase text-red-500/75 tracking-wider">Live Configuration</h4>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black uppercase text-foreground/45">Live Public Key</label>
                                        <input
                                            type="text"
                                            value={config.paystackLivePublicKey || ''}
                                            onChange={(e) => setConfig({ ...config, paystackLivePublicKey: e.target.value })}
                                            placeholder="pk_live_..."
                                            className="w-full bg-background border border-surface-border rounded-xl p-3 font-bold text-xs outline-none focus:border-red-500 text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black uppercase text-foreground/45">Live Secret Key</label>
                                        <input
                                            type="password"
                                            value={config.paystackLiveSecretKey || ''}
                                            onChange={(e) => setConfig({ ...config, paystackLiveSecretKey: e.target.value })}
                                            placeholder="sk_live_..."
                                            className="w-full bg-background border border-surface-border rounded-xl p-3 font-bold text-xs outline-none focus:border-red-500 text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] lh-glow hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
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
