
'use client';

import { motion } from 'framer-motion';

export default function LaHustleLoader() {
    return (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center transition-colors duration-300">
            <div className="relative">
                {/* O-cart Rolling Animation */}
                <motion.div
                    initial={{ x: -200, rotate: -360, opacity: 0 }}
                    animate={{
                        x: 0,
                        rotate: 0,
                        opacity: 1,
                        transition: {
                            type: "spring",
                            stiffness: 100,
                            damping: 20
                        }
                    }}
                    exit={{ x: 200, rotate: 360, opacity: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="text-8xl mb-4 relative drop-shadow-[0_0_15px_var(--primary-glow)]">
                        🛒
                        <div className="absolute -top-4 -right-2 text-4xl">O</div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-primary font-black text-xs uppercase tracking-[1em] pl-[1em]"
                    >
                        LaHustle LOADING
                    </motion.div>
                </motion.div>

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
            </div>
        </div>
    );
}
