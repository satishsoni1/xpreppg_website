/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Clean-medical palette: teal primary, deep navy, warm amber accent.
      // Token names are unchanged so every existing page picks up the new look.
      colors: {
        primary: "#0E7C86",
        primaryDark: "#0A6169",
        primaryDeep: "#084C52",
        secondary: "#EEF8F8",
        secondaryMiddle: "#D3EFF0",
        secondaryDark: "#A9DFE2",
        accent: "#F5A524",
        navy: "#0B2545",
        navyDark: "#071A33",
        navyLight: "#13315C",
        ink: "#0F172A",
        mist: "#F6F8FB",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)",
        lift: "0 2px 4px rgba(15,23,42,0.04), 0 24px 48px -16px rgba(11,37,69,0.25)",
      },
    },
  },
  plugins: [],
};
