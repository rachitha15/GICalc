/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gl: {
          low: '#10b981',    // Green - GL < 10
          medium: '#f59e0b', // Yellow - GL 10-20
          high: '#ef4444',   // Red - GL > 20
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  safelist: [
    'bg-green-50',
    'bg-green-100',
    'bg-yellow-50', 
    'bg-yellow-100',
    'bg-red-50',
    'bg-red-100',
    'text-green-800',
    'text-yellow-800', 
    'text-red-800',
    'border-green-400',
    'border-yellow-400',
    'border-red-400',
  ],
  plugins: [],
}