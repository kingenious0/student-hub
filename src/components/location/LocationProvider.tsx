'use client';

import { useEffect, ReactNode } from 'react';
import { initializeRadar, startTracking, setUserId, setMetadata } from '@/lib/location/radar-client';
import { useUser } from '@clerk/nextjs';

export default function LocationProvider({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        // 1. Initialize Radar
        initializeRadar();
    }, []);

    useEffect(() => {
        // 2. Identify User when logged in
        if (isLoaded && user && typeof window !== 'undefined') {
            setUserId(user.id);

            if (user.publicMetadata?.role) {
                setMetadata({
                    role: user.publicMetadata.role as string
                });
            }

            // Detect if inside Mobile WebView
            const isMobileApp = (window as any).ReactNativeWebView !== undefined;

            // 3. Auto-Start Tracking for Students (Efficient, Foreground Only)
            // Skip web-side tracking if we are in the Mobile App (Native handles it)
            if (!isMobileApp) {
                const isRunner = user.publicMetadata?.role === 'RUNNER' || user.publicMetadata?.isRunner;
                if (!isRunner) {
                    try {
                        startTracking('EFFICIENT', false);
                    } catch (e) {
                        console.warn('Web-side tracking failed, likely due to permissions.', e);
                    }
                }
            } else {
                console.log('Mobile App detected: Web-side tracking suppressed in favor of Native Tracking.');
            }
        }
    }, [isLoaded, user]);

    return <>{children}</>;
}
