/**
 * Typography System
 * - Clear hierarchy
 * - Accessible sizing
 * - Consistent line heights
 */

export const typography = {
  // Font families
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },

  // Heading sizes
  heading: {
    h1: {
      fontSize: '2.5rem',
      lineHeight: '1.2',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      lineHeight: '1.3',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      lineHeight: '1.4',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      lineHeight: '1.4',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      lineHeight: '1.5',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: 600,
    },
  },

  // Body text
  body: {
    lg: {
      fontSize: '1.125rem',
      lineHeight: '1.75',
      fontWeight: 400,
    },
    base: {
      fontSize: '1rem',
      lineHeight: '1.5',
      fontWeight: 400,
    },
    sm: {
      fontSize: '0.875rem',
      lineHeight: '1.43',
      fontWeight: 400,
    },
    xs: {
      fontSize: '0.75rem',
      lineHeight: '1.33',
      fontWeight: 400,
    },
  },

  // Labels and small text
  label: {
    fontSize: '0.875rem',
    lineHeight: '1.43',
    fontWeight: 500,
  },

  // Code/mono
  code: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    fontWeight: 500,
    fontFamily: "'SF Mono', Monaco, monospace",
  },
} as const;
