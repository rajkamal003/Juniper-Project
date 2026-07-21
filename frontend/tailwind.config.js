/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d8eeff',
          200: '#b9e0ff',
          300: '#89ceff',
          400: '#52b4ff',
          500: '#2787f5',
          600: '#1565d8',
          700: '#0f4eb7',
          800: '#124193',
          900: '#153775',
          950: '#0d214a',
        },
        darkbg: {
          DEFAULT: '#0B0F19',
          card: 'rgba(17, 24, 39, 0.7)',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        lightbg: {
          DEFAULT: '#F3F4F6',
          card: 'rgba(255, 255, 255, 0.75)',
          border: 'rgba(0, 0, 0, 0.06)'
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-12px) scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
