/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Accent scale is driven by CSS variables so users can pick a theme accent
        primary: {
          50: 'rgb(var(--accent-50) / <alpha-value>)',
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          200: 'rgb(var(--accent-200) / <alpha-value>)',
          300: 'rgb(var(--accent-300) / <alpha-value>)',
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          700: 'rgb(var(--accent-700) / <alpha-value>)',
          800: 'rgb(var(--accent-800) / <alpha-value>)',
          900: 'rgb(var(--accent-900) / <alpha-value>)',
          950: 'rgb(var(--accent-950) / <alpha-value>)',
        },
        secondary: {
          50: 'rgb(var(--secondary-50) / <alpha-value>)',
          100: 'rgb(var(--secondary-100) / <alpha-value>)',
          200: 'rgb(var(--secondary-200) / <alpha-value>)',
          300: 'rgb(var(--secondary-300) / <alpha-value>)',
          400: 'rgb(var(--secondary-400) / <alpha-value>)',
          500: 'rgb(var(--secondary-500) / <alpha-value>)',
          600: 'rgb(var(--secondary-600) / <alpha-value>)',
          700: 'rgb(var(--secondary-700) / <alpha-value>)',
          800: 'rgb(var(--secondary-800) / <alpha-value>)',
          900: 'rgb(var(--secondary-900) / <alpha-value>)',
        },
        // Neutral scale is also variable driven so dark surfaces get a richer, bluer tone
        gray: {
          50: 'rgb(var(--neutral-50) / <alpha-value>)',
          100: 'rgb(var(--neutral-100) / <alpha-value>)',
          200: 'rgb(var(--neutral-200) / <alpha-value>)',
          300: 'rgb(var(--neutral-300) / <alpha-value>)',
          400: 'rgb(var(--neutral-400) / <alpha-value>)',
          500: 'rgb(var(--neutral-500) / <alpha-value>)',
          600: 'rgb(var(--neutral-600) / <alpha-value>)',
          700: 'rgb(var(--neutral-700) / <alpha-value>)',
          800: 'rgb(var(--neutral-800) / <alpha-value>)',
          900: 'rgb(var(--neutral-900) / <alpha-value>)',
          950: 'rgb(var(--neutral-950) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
          sunken: 'rgb(var(--surface-sunken) / <alpha-value>)',
          inverse: 'rgb(var(--surface-inverse) / <alpha-value>)',
        },
        content: {
          DEFAULT: 'rgb(var(--content) / <alpha-value>)',
          muted: 'rgb(var(--content-muted) / <alpha-value>)',
          subtle: 'rgb(var(--content-subtle) / <alpha-value>)',
          inverse: 'rgb(var(--content-inverse) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.16)',
        lift: '0 2px 4px rgb(15 23 42 / 0.04), 0 18px 40px -18px rgb(15 23 42 / 0.28)',
        glow: '0 0 0 1px rgb(var(--accent-500) / 0.25), 0 12px 40px -12px rgb(var(--accent-500) / 0.55)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, rgb(var(--accent-500)) 0%, rgb(var(--secondary-500)) 100%)',
        'mesh': 'radial-gradient(at 12% 8%, rgb(var(--accent-400) / 0.30) 0px, transparent 55%), radial-gradient(at 88% 4%, rgb(var(--secondary-400) / 0.26) 0px, transparent 50%), radial-gradient(at 60% 92%, rgb(var(--accent-300) / 0.20) 0px, transparent 55%)',
        'grid-fade': 'linear-gradient(to bottom, rgb(var(--line) / 0.6) 1px, transparent 1px), linear-gradient(to right, rgb(var(--line) / 0.6) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
        'aurora': 'aurora 18s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        aurora: {
          '0%': { transform: 'translate3d(-4%, -2%, 0) scale(1)' },
          '50%': { transform: 'translate3d(4%, 3%, 0) scale(1.08)' },
          '100%': { transform: 'translate3d(-2%, 4%, 0) scale(1.02)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
