/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4DA6FF",
          50: "#EBF5FF",
          100: "#D6EBFF",
          200: "#ADD6FF",
          300: "#85C2FF",
          400: "#5CADFF",
          500: "#4DA6FF",
          600: "#3B8FEA",
          700: "#2A78D4",
          800: "#1A61BF",
          900: "#0D4AA9",
        },
        accent: {
          DEFAULT: "#1A2A44",
          50: "#E8ECF0",
          100: "#D1D8E0",
          200: "#A3B1C2",
          300: "#7589A3",
          400: "#476285",
          500: "#1A2A44",
          600: "#152236",
          700: "#101B29",
          800: "#0B131C",
          900: "#050A10",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-fg": "var(--card-fg)",
        muted: "var(--muted)",
        heading: "var(--heading)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
