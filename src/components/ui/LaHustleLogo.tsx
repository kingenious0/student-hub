'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface LaHustleLogoProps {
    className?: string;
    showTagline?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onClick?: () => void;
    priority?: boolean;
}

// height in px → width is auto (image aspect ratio ~4:1)
const sizeMap = {
    sm: 'h-6',   // ~24px
    md: 'h-8',   // ~32px  – navbar default
    lg: 'h-12',  // ~48px  – drawer header
    xl: 'h-16',  // ~64px  – splash / hero
};

export function LaHustleLogo({ className, showTagline = true, size = 'md', onClick }: LaHustleLogoProps) {
    const { theme } = useTheme();
    const isDark = theme === 'lahustle';

    const heightClass = sizeMap[size];

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center select-none shrink-0',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {/*
             * The real brand PNG: dark-green on white.
             * In dark mode we give it a tiny white pill so it reads clearly
             * against the dark background.
             */}
            <img
                src="/LaHustle-Original.png"
                alt="LaHustle – Skills. Gigs. Growth."
                className={cn(
                    heightClass,
                    'w-auto object-contain transition-all duration-200',
                    isDark && 'rounded-lg px-1.5 py-0.5'
                )}
                style={isDark ? { backgroundColor: 'rgba(255,255,255,0.95)' } : undefined}
                draggable={false}
            />
        </div>
    );
}
