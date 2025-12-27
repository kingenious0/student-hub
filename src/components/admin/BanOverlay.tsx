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
                    className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    style={{ pointerEvents: 'all' }}
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        className="max-w-2xl w-full"
                    >
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-8">
                            <motion.div
                                animate={{
                                    rotate: [0, -10, 10, -10, 10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                                className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center"
                            >
                                <span className="text-7xl">🚫</span>
                            </motion.div>
                        </div>

                        {/* Main Message */}
                        <div className="text-center mb-8">
                            <h1 className="text-6xl md:text-8xl font-black text-red-500 uppercase tracking-tighter mb-4 animate-pulse">
                                ACCOUNT BANNED
                            </h1>
                            <div className="h-1 w-32 bg-red-500 mx-auto mb-6"></div>
                            <p className="text-xl text-white/80 font-bold mb-4">
                                Your account has been suspended by an administrator.
                            </p>
                        </div>

                        {/* Reason Box */}
                        <div className="bg-red-950/50 border-2 border-red-500 rounded-2xl p-8 mb-8">
                            <p className="text-sm text-red-200 uppercase tracking-widest font-black mb-2">
                                REASON FOR BAN:
                            </p>
                            <p className="text-lg text-white font-bold">
                                {banReason}
                            </p>
                        </div>

                        {/* Restrictions List */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                            <p className="text-sm text-white/60 uppercase tracking-widest font-black mb-4">
                                ACCOUNT RESTRICTIONS:
                            </p>
                            <ul className="space-y-3 text-white/80">
                                <li className="flex items-center gap-3">
                                    <span className="text-red-500">❌</span>
                                    <span>Cannot make purchases</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-red-500">❌</span>
                                    <span>Cannot list products</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-red-500">❌</span>
                                    <span>Cannot post stories</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-red-500">❌</span>
                                    <span>Cannot send messages</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-500">✓</span>
                                    <span className="text-white/60">View-only access (can browse)</span>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="text-center">
                            <p className="text-sm text-white/40 mb-4">
                                If you believe this is a mistake, please contact support.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <a
                                    href="mailto:support@omni.com"
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm uppercase transition-all"
                                >
                                    Contact Support
                                </a>
                                <a
                                    href="/sign-out"
                                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm uppercase transition-all"
                                >
                                    Sign Out
                                </a>
                            </div>
                        </div>

                        {/* Warning Stripe */}
                        <div className="mt-8 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 rounded-full animate-pulse"></div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
