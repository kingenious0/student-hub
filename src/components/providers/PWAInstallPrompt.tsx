'use client';

import { useEffect, useState } from 'react';

const HIDDEN_KEY = 'LaHustle-pwa-hidden';

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
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    if (isStandalone()) return;

    const p = isIOS() ? 'ios' : isAndroid() ? 'android' : 'desktop';
    setPlatform(p);

    try {
      if (localStorage.getItem(HIDDEN_KEY)) return;
    } catch {}

    const timer = setTimeout(() => setShow(true), 3000);

    const onInstall = () => {
      setShow(false);
      try { localStorage.setItem(HIDDEN_KEY, '1'); } catch {}
    };
    window.addEventListener('appinstalled', onInstall);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('appinstalled', onInstall);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      await (deferredPrompt as any).userChoice;
      setDeferredPrompt(null);
      setShow(false);
      try { localStorage.setItem(HIDDEN_KEY, '1'); } catch {}
    } else {
      setShowManualHelp(true);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setShowManualHelp(false);
    try { localStorage.setItem(HIDDEN_KEY, '1'); } catch {}
  };

  const snooze = () => {
    setShow(false);
    setShowManualHelp(false);
  };

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
      <div className="fixed bottom-0 left-0 right-0 z-[999] bg-surface border-t border-surface-border px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/lahustle-icon.svg" alt="" className="w-9 h-9 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">Install LaHustle for easy access</p>
            <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest truncate">
              {isIOSPlatform ? 'Open in Safari → Share → Add to Home Screen' : 'One-tap install, works offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isIOSPlatform ? (
            <button
              onClick={() => setShowManualHelp(true)}
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

      {/* Manual install help sheet (shown for both desktop & iOS when no deferredPrompt) */}
      {showManualHelp && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowManualHelp(false)} />
          <div className="relative bg-surface border border-surface-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom">
            <button
              onClick={() => setShowManualHelp(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/60"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <img src="/lahustle-icon.svg" alt="" className="w-12 h-12 mb-4" />
            <h3 className="text-base font-black uppercase tracking-tight text-foreground mb-4">
              Install LaHustle{isIOSPlatform ? ' on iPhone' : ''}
            </h3>
            {isIOSPlatform ? (
              <ol className="space-y-3">
                {[
                  { step: '1', text: 'Tap the Share button', detail: 'Square icon with arrow at the bottom of Safari' },
                  { step: '2', text: 'Scroll down & tap "Add to Home Screen"', detail: 'Look for the + icon in the share sheet' },
                  { step: '3', text: 'Tap "Add" in the top-right corner', detail: 'LaHustle will appear on your home screen' },
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
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-foreground/80 font-medium">
                  Your browser didn&apos;t show the install prompt automatically. Here&apos;s how to install manually:
                </p>
                <ol className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">Click the install icon in your address bar</p>
                      <p className="text-[10px] text-foreground/40 font-bold">Look for a monitor+arrow icon on the right side of the URL bar</p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">Or use Chrome menu: ⋮ → Install LaHustle</p>
                      <p className="text-[10px] text-foreground/40 font-bold">Find it under the three-dot menu in your browser</p>
                    </div>
                  </li>
                </ol>
              </div>
            )}
            <button
              onClick={() => { setShowManualHelp(false); handleDismiss(); }}
              className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
