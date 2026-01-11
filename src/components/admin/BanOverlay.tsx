'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BanOverlay() {
    const [banned, setBanned] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkBanStatus();
    }, []);

    const checkBanStatus = async () => {
        try {
            const res = await fetch('/api/users/me');
            if (res.ok) {
                const data = await res.json();
                if (data.banned) {
                    setBanned(true);
                    setBanReason(data.banReason || 'Your account has been suspended.');
                }
            }
        } catch (e) {
            console.error('Failed to check ban status:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    return (
        <AnimatePresence>
            {banned && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] bg-black font-mono overflow-y-auto"
                    style={{ pointerEvents: 'all' }}
                >
                    {/* Background Effects (Fixed) */}
                    <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] z-10 pointer-events-none"></div>
                    <div className="fixed inset-0 bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 z-0 animate-pulse pointer-events-none"></div>
                    <div className="fixed inset-0 bg-red-900/10 z-0 pointer-events-none"></div>

                    {/* Scanline Overlay (Fixed) */}
                    <div className="fixed inset-0 pointer-events-none z-20 bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20"></div>

                    {/* Scrollable Container Wrapper */}
                    <div className="min-h-full flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="relative z-30 max-w-2xl w-full my-8"
                        >
                            {/* ALERT HEADER */}
                            <div className="relative mb-8 md:mb-12 text-center group">
                                {/* Glitch Shadows */}
                                <h1 className="absolute top-0 left-0 w-full text-5xl md:text-9xl font-black text-red-600 opacity-50 blur-[2px] animate-pulse uppercase tracking-tighter select-none scale-[1.02]">
                                    TERMINATED
                                </h1>
                                <h1 className="relative text-5xl md:text-9xl font-black text-white uppercase tracking-tighter select-none mix-blend-overlay">
                                    TERMINATED
                                </h1>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600 text-black px-4 py-1 font-black text-[10px] md:text-xs uppercase tracking-[0.5em] rotate-2 whitespace-nowrap">
                                    <span>System Lockdown</span>
                                </div>
                            </div>

                            {/* Main Container */}
                            <div className="bg-black/80 backdrop-blur-2xl border border-red-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)] relative">
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500"></div>

                                <div className="p-6 md:p-12 relative">
                                    {/* Reason Section */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                            <h2 className="text-red-500 text-xs font-black uppercase tracking-[0.3em]">
                                                Suspension Directive
                                            </h2>
                                        </div>
                                        <div className="bg-red-500/5 border-l-4 border-red-500 p-4 md:p-6 backdrop-blur-sm">
                                            <p className="text-red-500/50 text-[10px] font-bold uppercase mb-2">Primary Violation:</p>
                                            <p className="text-lg md:text-2xl font-bold text-white leading-relaxed font-sans break-words">
                                                "{banReason}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Consequences Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8">
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-4 opacity-50">
                                            <div className="text-2xl grayscale">🛍️</div>
                                            <div>
                                                <div className="text-[10px] text-red-400 uppercase font-black">Marketplace</div>
                                                <div className="text-sm font-bold text-white line-through decoration-red-500">Access Revoked</div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-4 opacity-50">
                                            <div className="text-2xl grayscale">📦</div>
                                            <div>
                                                <div className="text-[10px] text-red-400 uppercase font-black">Inventory</div>
                                                <div className="text-sm font-bold text-white line-through decoration-red-500">Frozen</div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-4 opacity-50">
                                            <div className="text-2xl grayscale">💳</div>
                                            <div>
                                                <div className="text-[10px] text-red-400 uppercase font-black">Payments</div>
                                                <div className="text-sm font-bold text-white line-through decoration-red-500">Suspended</div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-4 opacity-50">
                                            <div className="text-2xl grayscale">💬</div>
                                            <div>
                                                <div className="text-[10px] text-red-400 uppercase font-black">Social</div>
                                                <div className="text-sm font-bold text-white line-through decoration-red-500">Muted</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-4">
                                        <a
                                            href="/sign-out"
                                            className="block w-full py-4 bg-red-600 hover:bg-red-500 text-white text-center font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-[1.02] text-xs md:text-base"
                                        >
                                            Acknowledge & Terminate Session
                                        </a>

                                        <div className="flex justify-center">
                                            <a href="mailto:appeals@omni.com" className="text-xs text-white/30 hover:text-white uppercase tracking-widest transition-colors border-b border-transparent hover:border-white">
                                                Request Case Review
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Code */}
                                <div className="bg-black/50 p-4 border-t border-red-500/20 flex justify-between items-center text-[9px] text-red-500/40 font-mono">
                                    <span>ERR_CODE: USR_BAN_LVL_5</span>
                                    <span>{new Date().toISOString().split('T')[0]}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
