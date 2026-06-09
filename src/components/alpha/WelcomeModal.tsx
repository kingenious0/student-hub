'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Unique key for version 1 of alpha test
        const hasSeen = localStorage.getItem('LH_ALPHA_WELCOME_V1_KCS');
        if (!hasSeen) {
            setTimeout(() => setIsOpen(true), 1500); // 1.5s delay for dramatic effect
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('LH_ALPHA_WELCOME_V1_KCS', 'true');
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-[#050505] border border-[#39FF14] rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_100px_rgba(57,255,20,0.3)] relative overflow-hidden"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#39FF14]/50"></div>
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#39FF14]/10 rounded-full blur-3xl"></div>

                        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                className="w-20 h-20 rounded-full bg-[#39FF14]/10 flex items-center justify-center border border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                            >
                                <span className="text-4xl">🚀</span>
                            </motion.div>

                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                                    Initializing <span className="text-[#39FF14]">Test Phase</span>
                                </h2>
                                <div className="inline-block px-3 py-1 border border-[#39FF14]/30 rounded-full bg-[#39FF14]/5">
                                    <p className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.2em]">
                                        Dev Protocol v0.9
                                    </p>
                                </div>
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                            <div className="text-sm font-medium text-gray-400 space-y-4 text-left w-full px-2">
                                <div className="flex gap-3 items-start">
                                    <span className="text-lg">⚠️</span>
                                    <div>
                                        <strong className="text-white block text-xs uppercase tracking-widest mb-1">Payment Simulation</strong>
                                        <span className="text-xs">We are using Paystack Test Mode keys. No real money will be deducted from your account.</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <span className="text-lg">🧪</span>
                                    <div>
                                        <strong className="text-white block text-xs uppercase tracking-widest mb-1">Your Mission</strong>
                                        <span className="text-xs">Try to break the system. Explore products, simulate purchases, and test the checkout flow.</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <span className="text-lg">📡</span>
                                    <div>
                                        <strong className="text-white block text-xs uppercase tracking-widest mb-1">Feedback Loop</strong>
                                        <span className="text-xs">Report any bugs or suggestions through the feedback form in your settings.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full pt-4">
                                <button
                                    onClick={handleAccept}
                                    className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#39FF14]/20"
                                >
                                    Acknowledge
                                </button>
                                <p className="mt-4 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                    Engineered by Kingenious Creative Studio
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
