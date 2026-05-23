/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: "#0053E0",
        primaryDark: "#0044B8",
        primaryDeep: "#003490",
        secondary: "#EEF4FF",
        secondaryMiddle: "#DDEAFF",
        secondaryDark: "#B3CFFF",
        accent: "#5B8FF5",
        navy: "#0D1B3E",
        navyDark: "#071020",
        navyLight: "#162244",
      },
    },
  },
  plugins: [],
};
