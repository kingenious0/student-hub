'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { registerServiceWorker, subscribeUserToPush } from '@/lib/notifications/client';

export default function PushNotificationProvider() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const init = async () => {
      const reg = await registerServiceWorker();
      if (!reg) return;
      await subscribeUserToPush();
    };

    // Check if user enabled push in settings (stored in localStorage)
    const pushEnabled = localStorage.getItem('omni-push-enabled') === 'true';

    if (pushEnabled) {
      init();
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
