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
        background: '#030712',
        surface: '#0B132B',
        elevated: '#0F172A',
        border: '#1E293B',
        primary: '#38BDF8',
        secondary: '#818CF8',
        danger: '#DC2626',
        warning: '#F97316',
        watch: '#EAB308',
        safe: '#10B981'
      },
      fontFamily: {
        sans: ['"Fira Sans"', 'sans-serif'],
        heading: ['"Fira Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace']
      }
    },
  },
  plugins: [],
}
