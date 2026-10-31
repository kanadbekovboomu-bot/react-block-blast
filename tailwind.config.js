/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'line-flash': {
          '0%': { transform: 'scale(1)', opacity: '1', filter: 'brightness(2)' },
          '50%': { transform: 'scale(1.08)', opacity: '0.8', filter: 'brightness(2.5)' },
          '100%': { transform: 'scale(0.7)', opacity: '0', filter: 'brightness(1)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) scale(0.9)', opacity: '1' },
          '100%': { transform: 'translateY(-40px) scale(1.15)', opacity: '0' },
        }
      },
      animation: {
        'pop-in': 'pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'line-flash': 'line-flash 0.3s ease-out forwards',
        'float-up': 'float-up 1s ease-out forwards',
      }
    },
  },
  plugins: [],
}
