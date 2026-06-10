'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { registerServiceWorker, subscribeUserToPush } from '@/lib/notifications/client';

function PushPrompt({ onAccept, onDismiss }: { onAccept: () => void; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-surface border border-primary/30 rounded-2xl p-5 shadow-2xl shadow-primary/10">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">🔔</div>
          <div>
            <p className="text-sm font-black text-foreground uppercase tracking-tight">Stay Updated</p>
            <p className="text-xs text-foreground/60 font-bold mt-0.5">Get instant alerts when your orders update or vendors respond.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-xl bg-foreground/5 text-foreground/60 font-black text-[11px] uppercase tracking-widest hover:bg-foreground/10 transition-all"
          >
            Skip
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PushNotificationProvider() {
  return null;
}
