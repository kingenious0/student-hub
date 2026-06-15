'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeUserToPush } from '@/lib/notifications/client';

const PUSH_ASKED_KEY = 'LaHustle-push-asked';

export default function PushNotificationProvider() {
    const { isLoaded, isSignedIn } = useUser();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only run for signed-in users
        if (!isLoaded || !isSignedIn) return;

        // Don't show if browser doesn't support push
        if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

        // Don't show if permission already granted or denied
        if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

        // Don't show if we've already asked them before
        try {
            if (localStorage.getItem(PUSH_ASKED_KEY)) return;
        } catch { }

        // Show after 5s — enough time to land and perceive value
        const timer = setTimeout(() => setShow(true), 5000);
        return () => clearTimeout(timer);
    }, [isLoaded, isSignedIn]);

    const handleAccept = async () => {
        setShow(false);
        try { localStorage.setItem(PUSH_ASKED_KEY, '1'); } catch { }

        const ok = await subscribeUserToPush();
        if (!ok) {
            console.warn('[PushNotif] User denied or browser blocked push permission.');
        }
    };

    const handleDismiss = () => {
        setShow(false);
        // Mark as asked so we never show this banner again
        try { localStorage.setItem(PUSH_ASKED_KEY, '1'); } catch { }
    };

    // Don't render anything for guests or if already decided
    if (!isLoaded || !isSignedIn) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="push-banner"
                    initial={{ opacity: 0, y: -60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -60 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    className="fixed top-0 left-0 right-0 z-[999] pointer-events-none"
                >
                    <div className="pointer-events-auto mx-auto max-w-2xl px-4 pt-3">
                        <div className="flex items-center gap-3 bg-surface/95 backdrop-blur-xl border border-primary/20 rounded-2xl px-4 py-3 shadow-2xl shadow-primary/10">
                            {/* Bell icon */}
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-base">🔔</span>
                            </div>

                            {/* Message */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-foreground uppercase tracking-tight leading-none mb-0.5">
                                    Stay in the loop
                                </p>
                                <p className="text-[11px] text-foreground/50 font-medium truncate">
                                    Get instant alerts for orders, payments &amp; delivery updates
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={handleDismiss}
                                    className="text-[10px] font-black text-foreground/30 hover:text-foreground/60 uppercase tracking-widest transition-colors px-1"
                                    aria-label="Not now"
                                >
                                    Not now
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="py-2 px-4 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
                                >
                                    Enable
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
