/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8ee',
          100: '#f9edce',
          200: '#f2d898',
          300: '#e9be5c',
          400: '#e2a830',
          500: '#c8973a', // primary brand - warm coffee gold
          600: '#a67a2a',
          700: '#855e1f',
          800: '#6b4a1a',
          900: '#573c16',
          950: '#301f0b',
        },
        surface: {
          light:    '#ffffff',
          DEFAULT:  '#f8f5f0',
          elevated: '#f0ebe3',
          dark:     '#0a0a0a',
          'dark-elevated': '#141414',
          'dark-card':    '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'brand': '0 4px 20px -4px rgba(200, 151, 58, 0.4)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
