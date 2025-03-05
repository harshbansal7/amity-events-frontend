/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'draw-path': {
          '0%': { 'stroke-dashoffset': '1000', 'stroke-dasharray': '1000' },
          '100%': { 'stroke-dashoffset': '0', 'stroke-dasharray': '1000' },
        },
        'text-shimmer': {
          '0%': { 
            'background-position': '0% 50%',
          },
          '100%': { 
            'background-position': '100% 50%', 
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'draw-path': 'draw-path 4s ease-in-out forwards',
        'text-shimmer': 'text-shimmer 2.5s ease-out infinite alternate',
        'shimmer': 'shimmer 2s infinite',
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      },
      transformOrigin: {
        '0': '0%',
      },
      perspective: {
        '1000': '1000px',
      },
      rotate: {
        'y-90': 'rotateY(90deg)',
        'y-0': 'rotateY(0deg)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}