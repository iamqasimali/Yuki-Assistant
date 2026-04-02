/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        yuki: {
          bg: "var(--color-yuki-bg)",
          surface: "var(--color-yuki-surface)",
          border: "var(--color-yuki-border)",
          accent: "var(--color-yuki-accent)",
          muted: "var(--color-yuki-muted)",
          text: "var(--color-yuki-text)",
          "text-secondary": "var(--color-yuki-text-secondary)",
          "user-bubble": "var(--color-yuki-user-bubble)",
          "on-accent": "var(--color-yuki-on-accent)",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
