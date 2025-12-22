
'use client';
import { useEffect } from 'react';

export default function VendorHeartbeat() {
    useEffect(() => {
        const beat = async () => {
            try {
                await fetch('/api/vendor/heartbeat', { method: 'POST' });
            } catch (e) { /* silent fail */ }
        };

        const interval = setInterval(beat, 5 * 60 * 1000); // 5 mins
        beat(); // Initial beat

        return () => clearInterval(interval);
    }, []);

    return null; // Invisible
}
