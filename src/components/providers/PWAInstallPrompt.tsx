'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISSED_KEY = 'LaHustle-pwa-dismissed-v2';
const INSTALL_COUNT_KEY = 'LaHustle-pwa-install-count';

function isStandalone() {
    return typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );
}

function isIOS() {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isAndroid() {
    if (typeof window === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [show, setShow] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [platform, setPlatform] = useState('');
    const [installCount] = useState(() => {
        // Simulated social proof – grows over time (stored in localStorage)
        try {
            const stored = localStorage.getItem(INSTALL_COUNT_KEY);
            if (stored) return parseInt(stored, 10);
            // Seed with a realistic base number
            const base = Math.floor(Math.random() * 300) + 1200;
            localStorage.setItem(INSTALL_COUNT_KEY, String(base));
            return base;
        } catch { return 1347; }
    });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isStandalone()) return;

        const p = isIOS() ? 'ios' : isAndroid() ? 'android' : 'desktop';
        setPlatform(p);

        try {
            if (localStorage.getItem(DISMISSED_KEY)) return;
        } catch { }

        // HCI: Delay 8s so user has time to perceive the app value first
        timerRef.current = setTimeout(() => setShow(true), 8000);

        const onInstalled = () => {
            setShow(false);
            try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { }
        };
        window.addEventListener('appinstalled', onInstalled);

        // Check if there is already a captured prompt
        if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            (window as any).deferredPrompt = e;
        };
        window.addEventListener('beforeinstallprompt', handler);

        const onCaptured = (e: any) => {
            if (e.detail) {
                setDeferredPrompt(e.detail);
            }
        };
        window.addEventListener('captured-beforeinstallprompt', onCaptured);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            window.removeEventListener('appinstalled', onInstalled);
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('captured-beforeinstallprompt', onCaptured);
        };
    }, []);

    useEffect(() => {
        const onVisible = () => {
            if (isStandalone()) setShow(false);
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, []);

    const handleInstall = async () => {
        // Double check global prompt just in case
        const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? (window as any).deferredPrompt : null);
        if (promptToUse) {
            promptToUse.prompt();
            await promptToUse.userChoice;
            setDeferredPrompt(null);
            if (typeof window !== 'undefined') {
                (window as any).deferredPrompt = null;
            }
            setShow(false);
            try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { }
        } else {
            setShowGuide(true);
        }
    };

    const snooze = () => {
        setShow(false);
        setShowGuide(false);
        // Snooze only – don't permanently dismiss, so it can come back next session
    };

    const dismiss = () => {
        setShow(false);
        setShowGuide(false);
        try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { }
    };

    if (!show || isStandalone()) return null;

    const isIOSPlatform = platform === 'ios';

    const iosSteps = [
        { step: '1', text: 'Open in Safari', detail: 'This only works in Safari — not Chrome or Firefox' },
        { step: '2', text: 'Tap the Share button ⎙', detail: 'Square icon with an upward arrow at the bottom' },
        { step: '3', text: 'Tap "Add to Home Screen"', detail: 'Scroll down in the share sheet to find it' },
        { step: '4', text: 'Tap "Add"', detail: 'LaHustle will appear on your home screen instantly' },
    ];

    return (
        <>
            {/* ──────────────────────────────────────────────────────
                HCI-OPTIMISED FLOATING INSTALL CARD
                • Bottom-right corner = low disruption zone
                • Real brand logo + social proof = trust + urgency
                • Green CTA = brand-consistent, high contrast
                • Snooze vs Dismiss distinction = respects user intent
            ────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {show && !showGuide && (
                    <motion.div
                        key="pwa-card"
                        initial={{ opacity: 0, y: 80, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="fixed bottom-6 right-4 z-[998] max-w-[300px] w-full pointer-events-auto"
                        role="dialog"
                        aria-label="Install LaHustle App"
                    >
                        {/* Glow effect behind card */}
                        <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-3xl opacity-60 pointer-events-none" />

                        <div className="relative bg-surface border border-primary/30 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Top accent bar */}
                            <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

                            <div className="p-4">
                                {/* Header row */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    {/* Logo pill */}
                                    <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm border border-gray-100 shrink-0">
                                        <img
                                            src="/LaHustle-Original.png"
                                            alt="LaHustle"
                                            className="h-6 w-auto object-contain"
                                            draggable={false}
                                        />
                                    </div>

                                    {/* Close (snooze) button */}
                                    <button
                                        onClick={snooze}
                                        className="text-foreground/30 hover:text-foreground/60 transition-colors mt-0.5 shrink-0"
                                        aria-label="Remind me later"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Copy */}
                                <p className="text-sm font-black text-foreground leading-snug mb-1">
                                    Install for the full experience
                                </p>
                                <p className="text-[11px] text-foreground/50 font-medium leading-relaxed mb-3">
                                    {isIOSPlatform
                                        ? 'Works offline · No App Store needed · Opens instantly'
                                        : 'Works offline · Loads faster · Get order alerts'
                                    }
                                </p>

                                {/* Social proof badge */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex -space-x-1.5">
                                        {['#16a34a', '#15803d', '#14532d'].map((c, i) => (
                                            <div
                                                key={i}
                                                className="w-5 h-5 rounded-full border-2 border-surface flex items-center justify-center text-[8px] font-black text-white"
                                                style={{ backgroundColor: c }}
                                            >
                                                {['S', 'V', 'M'][i]}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-foreground/40">
                                        {installCount.toLocaleString()}+ students installed
                                    </span>
                                </div>

                                {/* CTAs */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleInstall}
                                        className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                    >
                                        {isIOSPlatform ? 'How to Install' : 'Install App'}
                                    </button>
                                    <button
                                        onClick={dismiss}
                                        className="px-3 py-2.5 rounded-xl text-[11px] font-black text-foreground/40 hover:text-foreground/70 hover:bg-surface-border transition-colors"
                                        aria-label="No thanks"
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ──────────────────────────────────────────────────────
                INSTALL GUIDE MODAL
            ────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {showGuide && (
                    <motion.div
                        key="pwa-guide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowGuide(false)}
                        />

                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="relative bg-surface border border-surface-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            {/* Close */}
                            <button
                                onClick={() => setShowGuide(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors rounded-lg hover:bg-surface"
                                aria-label="Close"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>

                            {/* Logo */}
                            <div className="bg-white rounded-xl px-4 py-2 inline-block mb-4 shadow-sm border border-gray-100">
                                <img src="/LaHustle-Original.png" alt="LaHustle" className="h-8 w-auto object-contain" />
                            </div>

                            <h3 className="text-base font-black uppercase tracking-tight text-foreground mb-1">
                                {isIOSPlatform ? 'Add to iPhone Home Screen' : 'Install LaHustle'}
                            </h3>
                            <p className="text-[11px] text-foreground/50 font-medium mb-5">
                                Takes 10 seconds · No App Store · Always free
                            </p>

                            {isIOSPlatform ? (
                                <ol className="space-y-4">
                                    {iosSteps.map((item) => (
                                        <li key={item.step} className="flex gap-3 items-start">
                                            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                                                {item.step}
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{item.text}</p>
                                                <p className="text-[10px] text-foreground/40 font-medium mt-0.5">{item.detail}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-3 items-start">
                                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center shrink-0 border border-primary/20">1</span>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Click the install icon in your address bar</p>
                                            <p className="text-[10px] text-foreground/40 font-medium mt-0.5">Look for a monitor + download-arrow icon on the right of the URL bar</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center shrink-0 border border-primary/20">2</span>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Or via Chrome menu: ⋮ → Install LaHustle</p>
                                            <p className="text-[10px] text-foreground/40 font-medium mt-0.5">Three-dot menu in the top-right of your browser</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => { setShowGuide(false); dismiss(); }}
                                className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                Got it — I&apos;ll install it now
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
