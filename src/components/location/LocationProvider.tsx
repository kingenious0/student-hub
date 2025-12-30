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

            // Optional: Set metadata if available
            if (user.publicMetadata?.role) {
                setMetadata({
                    role: user.publicMetadata.role as string
                });
            }

            // 3. Auto-Start Tracking for Students (Efficient, Foreground Only)
            // Runners manage their tracking manually via the "Go Online" toggle.
            const isRunner = user.publicMetadata?.role === 'RUNNER' || user.publicMetadata?.isRunner;

            if (!isRunner) {
                // "When In Use" (Foreground) permission, EFFICIENT mode
                startTracking('EFFICIENT', false);
            }
        }
    }, [isLoaded, user]);

    return <>{children}</>;
}
