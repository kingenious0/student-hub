
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function OnboardingCheck() {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // console.log('[DEBUG] OnboardingCheck - isLoaded:', isLoaded, 'userId:', user?.id);
        if (!isLoaded || !user) return;

        // GOD MODE BYPASS
        if (user.publicMetadata?.role === 'GOD_MODE') {
            return;
        }

        // Skip check for onboarding and admin pages
        if (pathname === '/onboarding' || pathname === '/command-center-z' || pathname === '/LaHustle-gate') {
            return;
        }

        const checkOnboarding = async () => {
            try {
                console.log('[DEBUG] OnboardingCheck - Verifying Sync...');
                // First, ensure the user is synced in Prisma
                const syncRes = await fetch('/api/auth/sync', { method: 'POST' });
                if (!syncRes.ok) console.warn('[DEBUG] Sync warning status:', syncRes.status);

                console.log('[DEBUG] OnboardingCheck - Fetching profile...');
                // Then check their onboarding status
                const res = await fetch('/api/users/me');
                const profileData = await res.json();
                console.log('[DEBUG] OnboardingCheck - Profile data received:', profileData);

                if (profileData.onboarded !== true) {
                    console.log('[DEBUG] OnboardingCheck - Not onboarded. Redirecting to /onboarding');
                    router.push('/onboarding');
                } else {
                    console.log('[DEBUG] OnboardingCheck - User already onboarded.');
                }
            } catch (error) {
                console.error('[DEBUG] Onboarding check failed error:', error);
            }
        };

        checkOnboarding();
    }, [user, isLoaded, pathname, router]);

    return null;
}
