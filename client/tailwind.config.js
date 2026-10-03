/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#102A56',
          darkNavy: '#071A38',
          green: '#43BD69',
          teal: '#1BB8C6',
          bg: '#F7F9FC',
          text: '#13233C',
          muted: '#68758A',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(16, 42, 86, 0.08)',
        premium: '0 12px 40px -10px rgba(7, 26, 56, 0.12)',
        glow: '0 0 20px rgba(27, 184, 198, 0.25)',
      },
    },
  },
  plugins: [],
}
