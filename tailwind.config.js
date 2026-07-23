/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'], display: ['Fraunces', 'Georgia', 'serif'] },
      colors: {
        ink: { 50: '#f6f7f9', 100: '#eceef2', 200: '#d5d9e2', 300: '#b0b8c7', 400: '#8590a8', 500: '#67738d', 600: '#525d76', 700: '#434c61', 800: '#3a4252', 900: '#1a2236', 950: '#0c1322' },
        brand: { 50: '#eef7ff', 100: '#d9edff', 200: '#bce0ff', 300: '#8ecdff', 400: '#59b0ff', 500: '#3392fb', 600: '#1d72f0', 700: '#155bdc', 800: '#1749b4', 900: '#193f8e', 950: '#142856' },
        accent: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
        cyanx: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
      },
      boxShadow: { soft: '0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)', card: '0 1px 3px rgba(16,24,40,0.05), 0 10px 30px rgba(16,24,40,0.06)', lift: '0 8px 30px rgba(16,24,40,0.10)', ring: '0 0 0 1px rgba(16,24,40,0.06)' },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-in': { '0%': { opacity: '0', transform: 'translateX(16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      animation: { 'fade-up': 'fade-up 0.5s ease-out both', 'fade-in': 'fade-in 0.4s ease-out both', 'slide-in': 'slide-in 0.3s ease-out both', 'scale-in': 'scale-in 0.25s ease-out both' },
    },
  },
  plugins: [],
};
