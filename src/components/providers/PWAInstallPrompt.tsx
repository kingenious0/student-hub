'use client';

import { useEffect, useState } from 'react';

const LS_KEY = 'omni-pwa-prompt';
const PAGE_VIEWS_KEY = 'omni-pwa-pageviews';

function getPromptState() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || 'null');
  } catch { return null; }
}

function savePromptState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

function incrementPageViews() {
  try {
    const v = parseInt(localStorage.getItem(PAGE_VIEWS_KEY) || '0', 10);
    localStorage.setItem(PAGE_VIEWS_KEY, String(v + 1));
    return v + 1;
  } catch { return 0; }
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Never prompt if already installed (running as standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Track page views
    const views = incrementPageViews();
    const state = getPromptState();

    if (state?.dismissed) return;
    if ((state?.shownCount || 0) >= 2) return;

    // Only show after at least 2 page views (let them browse first)
    if (views < 2) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a few seconds before showing so user sees content first
      setTimeout(() => {
        setShow(true);
        const curr = getPromptState();
        savePromptState({ shownCount: (curr?.shownCount || 0) + 1 });
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler, { once: true });

    // Also listen for successful install to clean up
    const onInstalled = () => {
      setShow(false);
      setDeferredPrompt(null);
      savePromptState({ dismissed: true, installed: true });
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDeferredPrompt(null);
    savePromptState({ dismissed: true, shownCount: (getPromptState()?.shownCount || 1) });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-[90vw] max-w-md bg-surface border border-surface-border rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-black text-primary">O</div>
        <div>
          <p className="text-sm font-bold text-foreground">Install OMNI</p>
          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Add to your home screen</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Install
        </button>
      </div>
    </div>
  );
}
