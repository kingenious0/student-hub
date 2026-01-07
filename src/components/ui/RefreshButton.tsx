'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function RefreshButton() {
    const [isSpinning, setIsSpinning] = useState(false);

    const handleRefresh = () => {
        setIsSpinning(true);
        // Small delay to show animation before reload
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    return (
        <button
            onClick={handleRefresh}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-surface-border hover:border-primary/50 text-foreground/60 hover:text-primary transition-all active:scale-90 group"
        >
            <motion.div
                animate={{ rotate: isSpinning ? 360 : 0 }}
                transition={{ repeat: isSpinning ? Infinity : 0, duration: 1, ease: "linear" }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                </svg>
            </motion.div>
        </button>
    );
}
