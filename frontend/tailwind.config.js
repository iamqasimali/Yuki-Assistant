/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        yuki: {
          bg: "#0f1117",
          surface: "#181b26",
          border: "#2a2f3d",
          accent: "#7c9cff",
          muted: "#8b92a8",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
