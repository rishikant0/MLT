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
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
