'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
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
          onClick={() => setShow(false)}
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
