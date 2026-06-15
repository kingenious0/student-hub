'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { motion } from 'framer-motion';

export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-surface-border hover:border-primary/50 transition-all active:scale-95 group"
        >
            <div className="relative w-4 h-4 overflow-hidden">
                <motion.div
                    initial={false}
                    animate={{ y: theme === 'lahustle' ? 0 : -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center"
                >
                    {/* Moon Icon (Dark/LaHustle) */}
                    <span className="text-xs h-5 flex items-center justify-center">🌙</span>
                    {/* Sun Icon (Light/Standard) */}
                    <span className="text-xs h-5 flex items-center justify-center text-orange-500">☀️</span>
                </motion.div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground transition-colors">
                {theme === 'lahustle' ? 'Dark' : 'Light'}
            </span>
        </button>
    );
}
