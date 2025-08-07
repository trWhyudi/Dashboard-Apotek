/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      primary: {
        600: '#1E90FF',
        700: '#1B82E6',
        800: '#1873CC',
      },
    },
  },
  plugins: [],
}

