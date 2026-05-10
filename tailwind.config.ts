import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        sand: {
          50: "#fdfaf3",
          100: "#f7efde",
          200: "#eedfbd",
        },
        ocean: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#b5e4ff",
          300: "#82d2ff",
          400: "#48b8ff",
          500: "#1f97ff",
          600: "#0a78f0",
          700: "#0a60c4",
          800: "#0e519c",
          900: "#11457b",
        },
        sunset: {
          400: "#ff8c6b",
          500: "#ff6b4a",
          600: "#ed4c2b",
        },
        midnight: {
          900: "#0b1437",
          800: "#101b46",
          700: "#1a2660",
        },
      },
      backgroundImage: {
        "gradient-aurora":
          "linear-gradient(135deg, #0b1437 0%, #1a2660 35%, #5b3aa0 70%, #ff6b4a 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)",
        "gradient-ocean":
          "linear-gradient(135deg, #1f97ff 0%, #5b3aa0 100%)",
        "gradient-sunset":
          "linear-gradient(135deg, #ff8c6b 0%, #ff4a8c 100%)",
      },
      boxShadow: {
        glow: "0 20px 50px -20px rgba(31,151,255,0.45)",
        "glow-warm": "0 20px 50px -20px rgba(255,107,74,0.4)",
        soft: "0 8px 24px -8px rgba(15,23,42,0.15)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
