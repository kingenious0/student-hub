
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function VendorOnboarding({ onComplete }: { onComplete: () => void }) {
    const [formData, setFormData] = useState({
        shopName: '',
        shopLandmark: '',
    });
    const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('SUBMITTING');

        try {
            const res = await fetch('/api/vendor/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                setStatus('SUCCESS');
                setTimeout(() => {
                    onComplete();
                }, 2000);
            } else {
                setStatus('ERROR');
            }
        } catch (error) {
            setStatus('ERROR');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-surface border border-surface-border rounded-[2.5rem] p-12 relative overflow-hidden"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2"></div>

                <div className="text-center relative z-10">
                    <div className="text-5xl mb-6">🏪</div>
                    <h1 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tighter">Partner Onboarding</h1>
                    <p className="text-primary/40 text-xs font-bold uppercase tracking-widest mb-12">Setup your LaHustle Shopfront</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4 mb-2 block">
                                    Shop Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., LaHustle Fast Food"
                                    required
                                    value={formData.shopName}
                                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                    className="w-full bg-background border-2 border-surface-border rounded-2xl py-4 px-6 text-foreground focus:border-primary outline-none transition-all placeholder:text-foreground/5 font-black uppercase tracking-tight"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4 mb-2 block">
                                    Shop Landmark
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Night Market, Near Hall 7"
                                    required
                                    value={formData.shopLandmark}
                                    onChange={(e) => setFormData({ ...formData, shopLandmark: e.target.value })}
                                    className="w-full bg-background border-2 border-surface-border rounded-2xl py-4 px-6 text-foreground focus:border-primary outline-none transition-all placeholder:text-foreground/5 font-black uppercase tracking-tight"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status !== 'IDLE'}
                            className="w-full py-5 bg-[#39FF14] text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 lh-glow"
                        >
                            {status === 'SUBMITTING' ? 'TRANSMITTING...' : status === 'SUCCESS' ? 'SUBMITTED' : 'INITIALIZE PARTNERSHIP'}
                        </button>

                        {status === 'ERROR' && (
                            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                                Transmission Failed. Try again.
                            </p>
                        )}
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
