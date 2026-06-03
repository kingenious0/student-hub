'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { registerServiceWorker } from '@/lib/notifications/client';

export default function PushNotificationProvider() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    registerServiceWorker();
  }, [isLoaded, isSignedIn]);

  return null;
}
