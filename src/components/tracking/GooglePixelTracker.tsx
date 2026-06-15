'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-LAHUSTLE123';

function TrackerContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
            (window as any).gtag('config', GA_MEASUREMENT_ID, {
                page_path: url,
            });
            console.log(`[Pixel] Page View: ${url}`);
        }
    }, [pathname, searchParams]);

    return null;
}

export default function GooglePixelTracker() {
    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
            <Suspense fallback={null}>
                <TrackerContent />
            </Suspense>
        </>
    );
}
