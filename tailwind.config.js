/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Playful Color Palette
        primary: {
          50: '#f3e8ff',
          100: '#e9d5ff', 
          500: '#9c27b0',
          600: '#8e24aa',
          700: '#7b1fa2',
          900: '#4a148c'
        },
        secondary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          900: '#0d47a1'
        },
        success: {
          50: '#e8f5e8',
          100: '#c8e6c9',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          900: '#1b5e20'
        },
        warning: {
          50: '#fff3e0',
          100: '#ffe0b2',
          500: '#ff9800',
          600: '#fb8c00',
          700: '#f57c00',
          900: '#e65100'
        },
        // Legacy GL colors (keeping for compatibility)
        gl: {
          low: '#4caf50',
          medium: '#ff9800', 
          high: '#ef4444',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-delayed': 'fadeIn 1s ease-out 0.3s both',
        'slide-in': 'slideIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'zoom-in': 'zoomIn 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'blob': 'blob 7s infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'success-bounce': 'successBounce 0.8s ease-out',
        'warning-shake': 'warningShake 0.6s ease-in-out',
        'celebration': 'celebration 1.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' }
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(147, 51, 234, 0.6)' }
        },
        successBounce: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' }
        },
        warningShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' }
        },
        celebration: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(-5deg)' },
          '50%': { transform: 'scale(1.2) rotate(5deg)' },
          '75%': { transform: 'scale(1.1) rotate(-5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  safelist: [
    // Background colors
    'bg-green-50', 'bg-green-100', 'bg-yellow-50', 'bg-yellow-100', 'bg-red-50', 'bg-red-100',
    // Text colors - CRITICAL for visibility
    'text-white', 'text-white/90', 'text-white/80', 'text-gray-700', 'text-gray-800', 'text-gray-600', 'text-gray-500',
    'text-green-800', 'text-yellow-800', 'text-red-800',
    // Border colors
    'border-green-400', 'border-yellow-400', 'border-red-400',
    'border-white/20', 'border-white/30', 'border-purple-200', 'border-purple-300/50',
    // Gradient colors
    'from-purple-600', 'via-blue-600', 'to-purple-800', 'from-purple-500', 'to-blue-600',
    'from-purple-700', 'to-blue-700', 'from-green-500', 'to-green-700', 'from-green-600', 'to-green-800',
    'from-purple-400', 'to-blue-400', 'from-white/90', 'to-white/80', 'from-purple-50/80', 'to-blue-50/80',
    // Background opacity
    'bg-white/95', 'bg-white/90', 'bg-white/80', 'bg-white/20', 'bg-white/10',
    'bg-orange-300/20', 'bg-green-300/20', 'bg-purple-100', 'bg-orange-100',
  ],
  plugins: [],
}