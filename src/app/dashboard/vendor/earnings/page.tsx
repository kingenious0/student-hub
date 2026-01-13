'use client';

import { useState, useEffect } from 'react';

export default function EarningsPage() {
    const [stats, setStats] = useState({
        balance: 0,
        frozenBalance: 0,
        totalWithdrawn: 0,
        pendingPayouts: 0,
    });
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        momoNumber: '',
        network: 'MTN',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/vendor/earnings');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setPayouts(data.payouts || []);
            }
        } catch (error) {
            console.error('Failed to fetch earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/vendor/payouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('✅ Payout request submitted!');
                setShowForm(false);
                fetchData();
                setFormData({
                    amount: '',
                    momoNumber: '',
                    network: 'MTN',
                });
            } else {
                const error = await res.json();
                alert(`❌ ${error.error || 'Failed to request payout'}`);
            }
        } catch (error) {
            console.error('Request error:', error);
            alert('❌ Something went wrong');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-surface border-b border-surface-border py-6 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Earnings & Payouts</h1>
                        <p className="text-foreground/60 mt-1">Manage your funds</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-3xl text-white">
                        <p className="font-bold opacity-80 mb-2">Available Balance</p>
                        <h2 className="text-5xl font-black mb-4">₵{stats.balance.toFixed(2)}</h2>
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full py-3 bg-white text-green-600 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            Request Payout
                        </button>
                    </div>

                    <div className="bg-surface p-8 rounded-3xl border-2 border-surface-border">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-foreground/60 font-bold mb-1">Pending Payouts</p>
                        <h2 className="text-3xl font-black">₵{stats.pendingPayouts.toFixed(2)}</h2>
                    </div>

                    <div className="bg-surface p-8 rounded-3xl border-2 border-surface-border">
                        <div className="text-4xl mb-4">💰</div>
                        <p className="text-foreground/60 font-bold mb-1">Total Withdrawn</p>
                        <h2 className="text-3xl font-black">₵{stats.totalWithdrawn.toFixed(2)}</h2>
                    </div>
                </div>

                {/* Payout History */}
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Transaction History</h2>
                {payouts.length === 0 ? (
                    <div className="text-center py-12 bg-surface rounded-2xl border-2 border-surface-border">
                        <p className="text-foreground/40 font-bold">No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payouts.map((payout) => (
                            <div
                                key={payout.id}
                                className="bg-surface border border-surface-border p-4 rounded-xl flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-black text-lg">Payout Request</p>
                                    <p className="text-xs text-foreground/40">
                                        {new Date(payout.createdAt).toLocaleDateString()} • {payout.network} {payout.momoNumber}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg">₵{payout.amount.toFixed(2)}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${payout.status === 'PROCESSED' ? 'bg-green-500/10 text-green-500' :
                                            payout.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-red-500/10 text-red-500'
                                        }`}>
                                        {payout.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Request Payout Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background border-2 border-surface-border rounded-3xl max-w-md w-full p-8">
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Request Payout</h2>

                        <form onSubmit={handleRequestPayout} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground/60 mb-2">Amount (₵)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    max={stats.balance}
                                    min="1"
                                    placeholder={`Max: ${stats.balance}`}
                                    className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-foreground/60 mb-2">Network</label>
                                    <select
                                        value={formData.network}
                                        onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl font-bold"
                                    >
                                        <option value="MTN">MTN</option>
                                        <option value="VODA">Telecel</option>
                                        <option value="AT">AT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-foreground/60 mb-2">Number</label>
                                    <input
                                        type="tel"
                                        value={formData.momoNumber}
                                        onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                                        placeholder="024..."
                                        className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-green-600"
                                >
                                    Confirm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-surface-hover text-foreground rounded-xl font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
