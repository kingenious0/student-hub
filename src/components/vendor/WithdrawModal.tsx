
'use client';
import { useState } from 'react';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    maxAmount: number;
    onSuccess: () => void;
}

export default function WithdrawModal({ isOpen, onClose, maxAmount, onSuccess }: WithdrawModalProps) {
    const [amount, setAmount] = useState('');
    const [momoNumber, setMomoNumber] = useState('');
    const [network, setNetwork] = useState('MTN');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            setError('Invalid amount');
            setLoading(false);
            return;
        }
        if (val > maxAmount) {
            setError('Insufficient funds');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/vendor/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: val, momoNumber, network })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to request withdrawal');
            }
        } catch (e) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-foreground/40 hover:text-foreground">✕</button>

                <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">Request Payout</h2>
                <p className="text-sm text-foreground/60 mb-6">Funds will be sent to your Mobile Money wallet.</p>

                <div className="mb-6 bg-primary/10 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Available</span>
                    <span className="text-xl font-black text-primary">₵{maxAmount.toFixed(2)}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Amount (₵)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-background border border-surface-border rounded-xl p-3 font-bold focus:border-primary outline-none"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Network</label>
                            <select
                                value={network}
                                onChange={(e) => setNetwork(e.target.value)}
                                className="w-full bg-background border border-surface-border rounded-xl p-3 font-bold focus:border-primary outline-none"
                            >
                                <option value="MTN">MTN MoMo</option>
                                <option value="TELECEL">Telecel Cash</option>
                                <option value="AT">AT Money</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Number</label>
                            <input
                                type="tel"
                                value={momoNumber}
                                onChange={(e) => setMomoNumber(e.target.value)}
                                className="w-full bg-background border border-surface-border rounded-xl p-3 font-bold focus:border-primary outline-none"
                                placeholder="024..."
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Processing...' : 'Confirm Withdrawal'}
                    </button>
                </form>
            </div>
        </div>
    );
}
