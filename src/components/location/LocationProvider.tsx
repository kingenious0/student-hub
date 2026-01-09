'use client';

import { useEffect, ReactNode } from 'react';
import { initializeRadar, startTracking, stopTracking, setUserId, setMetadata } from '@/lib/location/radar-client';
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
            const userId = user.id;
            const userRole = user.publicMetadata?.role as string;

            setUserId(userId);

            if (userRole) {
                setMetadata({
                    role: userRole
                });
            }

            // Detect if inside Mobile WebView
            const isMobileApp = (window as any).ReactNativeWebView !== undefined;

            // 3. Auto-Start Tracking for Students (Efficient, Foreground Only)
            // Skip web-side tracking if we are in the Mobile App (Native handles it)
            if (!isMobileApp) {
                const isRunner = userRole === 'RUNNER' || user.publicMetadata?.isRunner;

                // Only track non-runners via web (Runners use native app primarily, or manual toggle)
                if (!isRunner) {
                    try {
                        // Pass 'true' to indicate this is an init call, handled safely in client
                        startTracking('EFFICIENT', false);
                    } catch (e) {
                        // Rate limits might happen if we reload too fast, safely ignore
                        console.warn('Web-side tracking init warning:', e);
                    }
                }
            } else {
                console.log('Mobile App detected: Web-side tracking suppressed in favor of Native Tracking.');
            }
        }

        // Cleanup: Stop tracking when user changes or component unmounts
        // This prevents multiple intervals stacking up
        return () => {
            stopTracking();
        };
    }, [isLoaded, user?.id, user?.publicMetadata?.role]);

    return <>{children}</>;
}
