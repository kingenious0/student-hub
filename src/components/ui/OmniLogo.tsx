'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface OmniLogoProps {
    className?: string;
    showTagline?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onClick?: () => void;
    priority?: boolean;
}

const sizes = {
    sm: { icon: 'h-5', wordmark: 'text-[10px]', tagline: 'text-[7px]' },
    md: { icon: 'h-7', wordmark: 'text-sm', tagline: 'text-[9px]' },
    lg: { icon: 'h-10', wordmark: 'text-lg', tagline: 'text-xs' },
    xl: { icon: 'h-14', wordmark: 'text-2xl', tagline: 'text-sm' },
};

export function OmniLogo({ className, showTagline = true, size = 'md', onClick, priority }: OmniLogoProps) {
    const { theme } = useTheme();
    const isDark = theme === 'omni';
    const wordmarkColor = isDark ? '#ffffff' : '#0a0a0a';
    const taglineColor = isDark ? '#10B981' : '#059669';

    const s = sizes[size];

    return (
        <div
            onClick={onClick}
            className={cn('flex items-center gap-2 select-none shrink-0', onClick && 'cursor-pointer', className)}
        >
            <svg
                viewBox="0 0 512 512"
                className={cn(s.icon, 'w-auto')}
                aria-hidden="true"
                role="img"
            >
                <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                </defs>
                <g transform="translate(256, 130)">
                    <circle cx="-38" cy="0" r="54" fill="none" stroke="url(#g1)" strokeWidth="13" />
                    <circle cx="38" cy="0" r="54" fill="none" stroke="url(#g2)" strokeWidth="13" />
                </g>
                <text
                    x="256"
                    y="340"
                    fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
                    fontSize="136"
                    fontWeight="800"
                    fill={wordmarkColor}
                    textAnchor="middle"
                    letterSpacing="8"
                >
                    OMNI
                </text>
                {showTagline && (
                    <text
                        x="256"
                        y="386"
                        fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
                        fontSize="22"
                        fontWeight="600"
                        fill={taglineColor}
                        textAnchor="middle"
                        letterSpacing="14"
                    >
                        STUDENT MARKETPLACE
                    </text>
                )}
            </svg>

            <div className="flex flex-col leading-none">
                <span
                    className={cn(
                        'font-black tracking-tight uppercase italic',
                        s.wordmark,
                        isDark ? 'text-white' : 'text-black'
                    )}
                >
                    MARKETPLACE
                </span>
                {showTagline && (
                    <span className={cn('font-semibold uppercase tracking-[0.3em] text-emerald-500', s.tagline)}>
                        Student Marketplace
                    </span>
                )}
            </div>
        </div>
    );
}
