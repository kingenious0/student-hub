'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function CampusGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();

    const isOnboarding = pathname?.startsWith('/onboarding') || pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

    useEffect(() => {
        if (isLoaded && user && !isOnboarding) {
            checkProfile();
        }
    }, [isLoaded, user, isOnboarding]);

    const checkProfile = async () => {
        try {
            const res = await fetch('/api/users/me');
            const data = await res.json();

            if (data && !data.onboarded) return;

            // USTED-first launch: auto-assign university
            if (data && !data.university) {
                await fetch('/api/users/update-profile', {
                    method: 'POST',
                    body: JSON.stringify({ university: 'USTED' }),
                });
            }
        } catch (e) {
            console.error('Profile check failed', e);
        }
    };

    return <>{children}</>;
}
