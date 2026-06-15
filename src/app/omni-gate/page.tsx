'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LaHustleGate() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/command-center-z');
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white text-xl font-black animate-pulse">
                Redirecting to Command Center...
            </div>
        </div>
    );
}
