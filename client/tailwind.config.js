/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#81E6D9',
          DEFAULT: '#00BCD4',
          dark: '#006064',
        },
        secondary: {
          light: '#C6F4D6',
          DEFAULT: '#34C759',
          dark: '#2E865F',
        },
      },
    },
  },
  plugins: [],
}

