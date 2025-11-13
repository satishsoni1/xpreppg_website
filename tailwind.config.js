/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: "#FD560E",
        primaryDark: "#d44905",
        secondary:"#FFE473",
        secondaryMiddle:"#FDCF0D",
        secondaryDark:"#C9A100"
      },
    },
  },
  plugins: [],
};
