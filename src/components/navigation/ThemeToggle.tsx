
'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-[56px] h-10 rounded-full bg-white/5 border border-white/10 p-1 flex items-center transition-all hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            title={`Switch to ${theme === 'omni' ? 'Standard' : 'OMNI'} mode`}
        >
            <motion.div
                animate={{ x: theme === 'omni' ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${theme === 'omni' ? 'bg-[#39FF14] text-black shadow-[0_0_10px_#39FF14]' : 'bg-indigo-600 text-white'
                    }`}
            >
                {theme === 'omni' ? '🟢' : '🔵'}
            </motion.div>
        </button>
    );
}
