'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HciManager() {
    const router = useRouter();

    useEffect(() => {
        // 1. Register Service Worker
        if ('serviceWorker' in navigator) {
            const registerSW = () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((reg) => {
                        console.log('LaHustle Main Service Worker registered successfully scope:', reg.scope);
                    })
                    .catch((err) => {
                        console.warn('LaHustle Service Worker registration failed:', err);
                    });
            };

            if (document.readyState === 'complete') {
                registerSW();
            } else {
                window.addEventListener('load', registerSW);
                return () => window.removeEventListener('load', registerSW);
            }
        }

        // 2. Ultra-responsive Pre-fetching on Hover
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // Prefetch route when hovering over any local links
            const anchor = target.closest('a');
            if (anchor && anchor.href) {
                try {
                    const url = new URL(anchor.href);
                    if (url.origin === window.location.origin) {
                        router.prefetch(url.pathname);
                    }
                } catch (err) {
                    // Ignore malformed URLs
                }
            }

            // Prefetch high-res image source if available in data attributes
            const img = target.closest('img');
            if (img && img.dataset.highres) {
                const prefetchImg = new Image();
                prefetchImg.src = img.dataset.highres;
            }
        };

        document.addEventListener('mouseover', handleMouseOver, { passive: true });
        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, [router]);

    return null;
}
