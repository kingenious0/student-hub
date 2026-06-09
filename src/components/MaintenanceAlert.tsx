'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MaintenanceAlertProps {
    onClose?: () => void;
}

export default function MaintenanceAlert({ onClose }: MaintenanceAlertProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animated progress bar
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 0;
                return prev + 1;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative w-full max-w-md"
            >
                {/* Main Card */}
                <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-500/30 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Animated Top Border */}
                    <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>

                    {/* Content */}
                    <div className="p-8 md:p-10">
                        {/* Icon */}
                        <motion.div
                            animate={{
                                rotate: [0, -10, 10, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                            }}
                            className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30"
                        >
                            <span className="text-5xl">🚧</span>
                        </motion.div>

                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-3 uppercase tracking-tight">
                            System Maintenance
                        </h2>

                        {/* Subtitle */}
                        <p className="text-sm text-gray-400 text-center mb-6 font-medium">
                            We're currently performing scheduled maintenance to improve your experience
                        </p>

                        {/* Details */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                                        Temporary Unavailability
                                    </p>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        All marketplace features are temporarily disabled while we upgrade our systems.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="text-green-500 text-lg mt-0.5">⏱️</span>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                                        Expected Duration
                                    </p>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        We'll be back online shortly. Thank you for your patience.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    System Status
                                </span>
                                <span className="text-[10px] font-mono text-red-500">
                                    OFFLINE
                                </span>
                            </div>
                            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                    style={{ width: `${progress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Check Status
                            </button>

                            <div className="text-center">
                                <p className="text-[10px] text-gray-600 font-medium">
                                    Need help?{' '}
                                    <a
                                        href="mailto:support@LaHustle.com"
                                        className="text-red-500 hover:text-red-400 underline"
                                    >
                                        Contact Support
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Badge */}
                    <div className="bg-black/40 border-t border-white/5 px-6 py-3 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                            Maintenance in Progress
                        </span>
                    </div>
                </div>

                {/* Decorative Glow */}
                <div className="absolute inset-0 -z-10 bg-red-500/20 blur-3xl rounded-full"></div>
            </motion.div>
        </div>
    );
}
