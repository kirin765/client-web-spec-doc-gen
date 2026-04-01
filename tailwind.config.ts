import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ============================================================================
      // COLOR PALETTE — Professional marketplace aesthetic
      // ============================================================================
      colors: {
        // Primary: Trustworthy blue
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3a66',
        },
        // Secondary: Professional slate
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Success: Growth indicator
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // Warning: Caution indicator
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        // Error: Destructive actions
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Neutral: Background & borders
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Legacy navy (for backward compatibility)
        navy: {
          800: '#1e2d42',
          900: '#0d1a2e',
          950: '#0a1628',
        },
      },

      // ============================================================================
      // TYPOGRAPHY SYSTEM
      // ============================================================================
      fontFamily: {
        // Display font: Clean, modern sans-serif for headings
        display: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Body font: Highly readable for long-form content
        body: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Mono: For code, IDs, prices
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Display sizes (headings)
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['28px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],

        // Heading sizes
        'heading-xl': ['24px', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-lg': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        'heading-xs': ['14px', { lineHeight: '1.5', fontWeight: '600' }],

        // Body sizes
        'body-lg': ['16px', { lineHeight: '1.6' }],
        'body-md': ['15px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'body-xs': ['12px', { lineHeight: '1.5' }],

        // Caption & labels
        'caption-md': ['13px', { lineHeight: '1.5', fontWeight: '500' }],
        'caption-sm': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },

      // ============================================================================
      // SPACING SCALE (8px base unit)
      // ============================================================================
      spacing: {
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
      },

      // ============================================================================
      // BORDER RADIUS
      // ============================================================================
      borderRadius: {
        none: '0',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },

      // ============================================================================
      // SHADOWS (depth system)
      // ============================================================================
      boxShadow: {
        // Surface shadows (subtle elevation)
        'shadow-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'shadow-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'shadow-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

        // Card shadows
        card: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 24px 0 rgba(0, 0, 0, 0.12)',

        // Modal shadows
        modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

        // Elevation shadows
        'elevate-xs': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'elevate-sm': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'elevate-md': '0 8px 16px rgba(0, 0, 0, 0.1)',
      },

      // ============================================================================
      // TRANSITIONS & ANIMATIONS
      // ============================================================================
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ============================================================================
      // UTILITIES & HELPERS
      // ============================================================================
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(135deg, rgba(15, 23, 42, 0.02) 0%, rgba(15, 23, 42, 0.04) 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
