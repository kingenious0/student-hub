'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImpersonationBanner() {
    const [impersonating, setImpersonating] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        // Check if we're impersonating
        const checkImpersonation = () => {
            const impersonateId = document.cookie
                .split('; ')
                .find(row => row.startsWith('IMPERSONATE_USER_ID='))
                ?.split('=')[1];

            if (impersonateId) {
                setImpersonating(impersonateId);
                fetchUserData(impersonateId);
            } else {
                setImpersonating(null);
                setUserData(null);
            }
        };

        checkImpersonation();
        // Check every 2 seconds
        const interval = setInterval(checkImpersonation, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchUserData = async (userId: string) => {
        try {
            const res = await fetch(`/api/admin/impersonate?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
            }
        } catch (e) {
            console.error('Failed to fetch impersonated user data:', e);
        }
    };

    const stopImpersonation = async () => {
        try {
            await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'STOP' })
            });

            // Clear local state
            document.cookie = 'IMPERSONATE_USER_ID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setImpersonating(null);
            setUserData(null);

            // Optionally reload to clear any cached user data
            window.location.reload();
        } catch (e) {
            alert('Failed to stop impersonation');
        }
    };

    return (
        <AnimatePresence>
            {impersonating && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-[60px] left-0 right-0 z-[9999] bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl"
                >
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl animate-pulse">👁️</span>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-wider">
                                        Impersonation Mode (Read-Only)
                                    </p>
                                    <p className="text-xs opacity-90">
                                        Viewing as: <span className="font-bold">{userData?.name || userData?.email || 'Loading...'}</span>
                                        {userData && (
                                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-[10px] uppercase font-black">
                                                {userData.role}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {userData && (
                                <div className="flex items-center gap-3 text-xs ml-8">
                                    <div className="px-3 py-1 bg-white/10 rounded-lg">
                                        <span className="opacity-70">Balance:</span>
                                        <span className="font-black ml-1">₵{userData.balance?.toFixed(2)}</span>
                                    </div>
                                    {userData.walletFrozen && (
                                        <div className="px-3 py-1 bg-red-500/30 border border-red-500 rounded-lg font-black">
                                            ❄️ WALLET FROZEN
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={stopImpersonation}
                            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-black text-xs uppercase hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                            ✕ Exit Impersonation
                        </button>
                    </div>

                    {/* Warning stripe */}
                    <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 animate-pulse"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
