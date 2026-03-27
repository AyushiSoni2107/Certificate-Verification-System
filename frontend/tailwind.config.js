/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Unbounded", "sans-serif"],
        body: ["Source Sans 3", "sans-serif"],
      },
      colors: {
        ink: "#0f1b2d",
        "ink-soft": "#3b4b66",
        paper: "#f7f2e8",
        accent: "#ff6a3d",
        "accent-dark": "#e14c24",
        mint: "#00b894",
        sky: "#7aa7ff",
      },
      boxShadow: {
        hero: "0 20px 60px rgba(15, 27, 45, 0.16)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.8s ease forwards",
      },
    },
  },
  plugins: [],
};
