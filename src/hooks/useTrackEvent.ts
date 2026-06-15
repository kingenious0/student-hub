'use client';

/**
 * useTrackEvent
 * 
 * Reusable hook to fire custom pixel events to Google Analytics / Tag Manager.
 */
export default function useTrackEvent() {
    const trackEvent = (eventName: string, params?: Record<string, any>) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', eventName, params);
            console.log(`[Pixel Event] "${eventName}" fired:`, params);
        }
    };

    return { trackEvent };
}
