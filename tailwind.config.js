/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          light: '#EDE9FE',
        },
        secondary: {
          DEFAULT: '#64748B',
        },
        accent: {
          DEFAULT: '#06B6D4',
        },
        gl: {
          low: '#06B6D4',
          'low-bg': '#CFFAFE',
          moderate: '#F59E0B',
          'moderate-bg': '#FFFBEB',
          high: '#DC2626',
          'high-bg': '#FEF2F2',
        },
        text: {
          primary: '#1F2937',
          secondary: '#64748B',
          muted: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          focus: '#7C3AED',
        },
      },
      animation: {
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'count-up': 'countUp 0.8s ease-out',
        'meter-draw': 'meterDraw 1s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        countUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        meterDraw: {
          '0%': { strokeDasharray: '0 100' },
          '100%': { strokeDasharray: '75 100' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
    },
  },
  plugins: [],
}