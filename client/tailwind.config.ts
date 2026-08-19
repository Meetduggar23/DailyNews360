import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        mist: "rgb(var(--mist) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Source Sans 3", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Source Serif 4", "Georgia", "Cambria", "Times New Roman", "serif"],
        display: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
        times: ["Times New Roman", "Times", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.05)",
        lifted: "0 6px 24px rgba(0,0,0,0.10)",
      },
      maxWidth: {
        article: "760px",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        ticker: "ticker 60s linear infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "fade-in": "fade-in 0.35s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;