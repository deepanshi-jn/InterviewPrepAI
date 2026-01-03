/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF9324',
      },
      fontFamily: {
        display: ['Urbanist', 'sans-serif'],
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}

