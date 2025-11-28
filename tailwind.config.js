/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1e293b',
          950: '#020617',
        }
      },
      animation: {
        float: 'float 50s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(100%) translateX(0)', opacity: '0' },
          '5%': { opacity: '0.9' },
          '50%': { transform: 'translateY(-50vh) translateX(20px)', opacity: '0.9' },
          '90%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-120vh) translateX(-20px)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: [],
}