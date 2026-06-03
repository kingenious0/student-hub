'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Wallet, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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

    // Pre-fill the MoMo number with the user's saved registration phoneNumber
    useEffect(() => {
        if (isOpen) {
            fetch('/api/users/me')
                .then(res => res.json())
                .then(data => {
                    if (data?.phoneNumber) {
                        setMomoNumber(data.phoneNumber);
                    }
                })
                .catch(err => console.error("Failed to load user MoMo details:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const NetworkLogo = ({ network }: { network: string }) => {
        switch (network) {
            case 'MTN':
                return (
                    <svg viewBox="0 0 40 40" className="w-8 h-8">
                        <rect width="40" height="40" rx="8" fill="#FBBF24" />
                        <text x="50%" y="52%" dominantBaseline="central" textAnchor="middle" fill="#1A1A2E" fontFamily="Arial" fontSize="15" fontWeight="900" letterSpacing="-0.5">MTN</text>
                    </svg>
                );
            case 'TELECEL':
                return (
                    <svg viewBox="0 0 40 40" className="w-8 h-8">
                        <rect width="40" height="40" rx="20" fill="#E11D48" />
                        <text x="50%" y="52%" dominantBaseline="central" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="9" fontWeight="800" letterSpacing="0.5">TEL</text>
                    </svg>
                );
            case 'AT':
                return (
                    <svg viewBox="0 0 40 40" className="w-8 h-8">
                        <rect width="40" height="40" rx="8" fill="#0EA5E9" />
                        <text x="50%" y="52%" dominantBaseline="central" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="13" fontWeight="900">AT</text>
                    </svg>
                );
            default:
                return null;
        }
    };

    const networks = [
        { 
            id: 'MTN', 
            name: 'MTN MoMo', 
            logo: <NetworkLogo network="MTN" />,
            activeStyles: 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
            inactiveStyles: 'border-surface-border bg-background/50 hover:border-amber-500/50 hover:bg-amber-500/5 text-foreground/70'
        },
        { 
            id: 'TELECEL', 
            name: 'Telecel', 
            logo: <NetworkLogo network="TELECEL" />,
            activeStyles: 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
            inactiveStyles: 'border-surface-border bg-background/50 hover:border-rose-500/50 hover:bg-rose-500/5 text-foreground/70'
        },
        { 
            id: 'AT', 
            name: 'AT Money', 
            logo: <NetworkLogo network="AT" />,
            activeStyles: 'border-sky-500 bg-sky-500/10 text-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.15)]',
            inactiveStyles: 'border-surface-border bg-background/50 hover:border-sky-500/50 hover:bg-sky-500/5 text-foreground/70'
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            setError('Please enter a valid amount');
            setLoading(false);
            return;
        }
        if (val > maxAmount) {
            setError('Insufficient wallet balance');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/vendor/payouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: val, 
                    momoNumber, 
                    network: network === 'TELECEL' ? 'VODA' : network 
                })
            });

            if (res.ok) {
                toast.success(`GHS ${val.toFixed(2)} payout requested successfully!`);
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to request withdrawal');
            }
        } catch (e) {
            setError('Communication to the transaction ledger failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-surface border border-surface-border rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 relative overflow-hidden shadow-2xl"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all focus:outline-none"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-1 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-primary" /> Payout Request
                    </h2>
                    <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">Withdraw your escrowed earnings directly.</p>
                </div>

                {/* Balance Display */}
                <div className="mb-8 p-5 bg-primary/5 border border-primary/10 rounded-2xl flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Available Funds</span>
                        <span className="text-3xl font-black tracking-tight text-foreground">₵{maxAmount.toFixed(2)}</span>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/10 relative z-10">
                        <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-foreground/40">Amount to Withdraw (₵)</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 font-black text-sm group-focus-within:text-primary transition-colors">₵</div>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-background/50 border border-surface-border rounded-xl pl-9 pr-4 py-4 font-bold text-sm focus:border-primary outline-none transition-all placeholder:text-foreground/20 text-foreground"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Network Select Grid */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-foreground/40">MoMo Provider</label>
                        <div className="grid grid-cols-3 gap-2">
                            {networks.map((net) => {
                                const isActive = network === net.id;
                                return (
                                    <button
                                        key={net.id}
                                        type="button"
                                        onClick={() => setNetwork(net.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 font-bold text-center transition-all duration-300 relative focus:outline-none ${
                                            isActive ? net.activeStyles : net.inactiveStyles
                                        }`}
                                    >
                                        <div className="mb-1.5 shadow-sm">
                                            {net.logo}
                                        </div>
                                        <span className="text-[10px] font-black tracking-tight uppercase leading-none">{net.name}</span>
                                        {isActive && (
                                            <div className="absolute top-1.5 right-1.5 text-inherit">
                                                <CheckCircle2 className="w-3.5 h-3.5 fill-background" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Momo Number Input */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-foreground/40">Recipient Mobile Number</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="tel"
                                value={momoNumber}
                                onChange={(e) => setMomoNumber(e.target.value)}
                                className="w-full bg-background/50 border border-surface-border rounded-xl pl-11 pr-4 py-4 font-bold text-sm focus:border-primary outline-none transition-all placeholder:text-foreground/20 text-foreground"
                                placeholder="024XXXXXXX"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold uppercase tracking-wide">
                            🚨 {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4.5 bg-primary hover:brightness-110 disabled:opacity-50 text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-lg omni-glow flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'TRANSMITTING REQUEST...'
                        ) : (
                            <>Confirm Withdrawal</>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
