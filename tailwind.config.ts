import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import { colors, shadows, spacing, borderRadius } from '@/lib/design/colors';
import { typography } from '@/lib/design/typography';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Color system
      colors: {
        primary: colors.primary,
        accent: colors.accent,
        neutral: colors.neutral,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
      },

      // Shadows
      boxShadow: {
        none: shadows.none,
        xs: shadows.xs,
        sm: shadows.sm,
        base: shadows.base,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
      },

      // Spacing
      spacing: {
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        '2xl': spacing['2xl'],
        '3xl': spacing['3xl'],
      },

      // Border radius
      borderRadius: {
        none: borderRadius.none,
        sm: borderRadius.sm,
        base: borderRadius.base,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        full: borderRadius.full,
      },

      // Typography
      fontFamily: {
        sans: typography.fonts.sans,
        mono: typography.fonts.mono,
      },

      // Font sizes
      fontSize: {
        xs: [typography.body.xs.fontSize, typography.body.xs.lineHeight],
        sm: [typography.body.sm.fontSize, typography.body.sm.lineHeight],
        base: [typography.body.base.fontSize, typography.body.base.lineHeight],
        lg: [typography.body.lg.fontSize, typography.body.lg.lineHeight],
        'h6': [typography.heading.h6.fontSize, typography.heading.h6.lineHeight],
        'h5': [typography.heading.h5.fontSize, typography.heading.h5.lineHeight],
        'h4': [typography.heading.h4.fontSize, typography.heading.h4.lineHeight],
        'h3': [typography.heading.h3.fontSize, typography.heading.h3.lineHeight],
        'h2': [typography.heading.h2.fontSize, typography.heading.h2.lineHeight],
        'h1': [typography.heading.h1.fontSize, typography.heading.h1.lineHeight],
      },

      // Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },

      // Gradients
      backgroundImage: {
        'gradient-primary': `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
        'gradient-accent': `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[600]} 100%)`,
      },
    },
  },
  plugins: [
    // Custom plugin for component variants
    plugin(function ({ addComponents, theme }) {
      const buttons = {
        '.btn': {
          '@apply font-medium transition-colors rounded-lg px-4 py-2 inline-flex items-center gap-2': {},
        },
        '.btn-primary': {
          '@apply bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50': {},
        },
        '.btn-secondary': {
          '@apply bg-neutral-200 text-neutral-900 hover:bg-neutral-300 disabled:opacity-50': {},
        },
        '.btn-outline': {
          '@apply border border-neutral-300 text-neutral-900 hover:bg-neutral-50 disabled:opacity-50': {},
        },
        '.btn-danger': {
          '@apply bg-error text-white hover:bg-opacity-90 disabled:opacity-50': {},
        },
      };

      const forms = {
        '.form-input': {
          '@apply w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100': {},
        },
        '.form-label': {
          '@apply block text-sm font-medium text-neutral-700 mb-1': {},
        },
      };

      const cards = {
        '.card': {
          '@apply rounded-lg border border-neutral-200 bg-white p-6 shadow-sm': {},
        },
      };

      addComponents({ ...buttons, ...forms, ...cards });
    }),
  ],
};

export default config;
