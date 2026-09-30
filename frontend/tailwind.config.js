/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2fb",
          100: "#d7e0f5",
          200: "#aebeeb",
          300: "#7f97dc",
          400: "#5470c9",
          500: "#34519f",
          600: "#253f82",
          700: "#1d3269",
          800: "#182a56",
          900: "#141f42",
          950: "#0d1730",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
