import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0A0A0F",
        surface: "#1A1A2E",
        "surface-2": "#2D1B69",
        primary: "#7C3AED",
        "primary-light": "#A78BFA",
        "primary-muted": "#C4B5FD",
        cream: "#F5F0FF",
        "cream-dim": "#B8B0CC",
        accent: "#34D399",
        "accent-orange": "#FB923C",
        "accent-rose": "#F43F5E",
        indigo: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae2fd",
          300: "#7ccbfd",
          400: "#4facfe",
          500: "#2a8cf5",
          600: "#1d7ad6",
          700: "#1362b3",
          800: "#0b498f",
          900: "#073266",
        },
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "flow": "flow 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        flow: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "radial-gradient(ellipse at 20% 50%, #2D1B69 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #1e1b4b 0%, transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
