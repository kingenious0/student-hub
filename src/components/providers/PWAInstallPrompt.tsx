'use client';

import { useEffect, useState } from 'react';

const HIDDEN_KEY = 'omni-pwa-hidden';

function isStandalone() {
  return typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
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
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    if (isStandalone()) return;

    const p = isIOS() ? 'ios' : isAndroid() ? 'android' : 'desktop';
    setPlatform(p);

    try {
      if (localStorage.getItem(HIDDEN_KEY)) return;
    } catch {}

    // Show after 3 seconds
    const timer = setTimeout(() => setShow(true), 3000);

    // Listen for native install event
    const onInstall = () => {
      setShow(false);
      try { localStorage.setItem(HIDDEN_KEY, '1'); } catch {}
    };
    window.addEventListener('appinstalled', onInstall);

    // Capture beforeinstallprompt for Android/Desktop
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('appinstalled', onInstall);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setShowIOSHelp(false);
    try { localStorage.setItem(HIDDEN_KEY, '1'); } catch {}
  };

  const snooze = () => {
    setShow(false);
    setShowIOSHelp(false);
  };

  // Recheck on visibility change (user might have added to home screen)
  useEffect(() => {
    const onVisible = () => {
      if (isStandalone()) setShow(false);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  if (!show || isStandalone()) return null;

  const isIOSPlatform = platform === 'ios';

  return (
    <>
      {/* Slim bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] bg-surface border-t border-surface-border px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-base font-black text-primary">O</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">Install OMNI for easy access</p>
            <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest truncate">
              {isIOSPlatform ? 'Open in Safari → Share → Add to Home Screen' : 'One-tap install, works offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isIOSPlatform ? (
            <button
              onClick={() => setShowIOSHelp(!showIOSHelp)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              How to Install
            </button>
          ) : (
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Install
            </button>
          )}
          <button
            onClick={snooze}
            className="w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
            aria-label="Dismiss for now"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      {/* iOS help sheet */}
      {isIOSPlatform && showIOSHelp && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowIOSHelp(false)} />
          <div className="relative bg-surface border border-surface-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom">
            <button
              onClick={() => setShowIOSHelp(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/60"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary mb-4">O</div>
            <h3 className="text-base font-black uppercase tracking-tight text-foreground mb-4">Install OMNI on iPhone</h3>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Tap the Share button', detail: 'Square icon with arrow at the bottom of Safari' },
                { step: '2', text: 'Scroll down & tap "Add to Home Screen"', detail: 'Look for the + icon in the share sheet' },
                { step: '3', text: 'Tap "Add" in the top-right corner', detail: 'OMNI will appear on your home screen' },
              ].map((item) => (
                <li key={item.step} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.text}</p>
                    <p className="text-[10px] text-foreground/40 font-bold">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <button
              onClick={() => { setShowIOSHelp(false); handleDismiss(); }}
              className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Got it, I&apos;ll install later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
