/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        primaryDark: "#1D4ED8",
        primaryDeep: "#1E40AF",
        secondary: "#EFF6FF",
        secondaryMiddle: "#DBEAFE",
        secondaryDark: "#BFDBFE",
        accent: "#60A5FA",
        navy: "#1E3A5F",
        navyDark: "#0F2544",
        navyLight: "#264A7A",
      },
    },
  },
  plugins: [],
};
