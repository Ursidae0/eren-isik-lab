import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#050C08",
          900: "#0B1A10",
          800: "#10261A",
          700: "#173824",
          600: "#205033",
        },
        mist: {
          950: "#111815",
          900: "#1B2521",
          800: "#2D3B36",
          700: "#40504A",
          600: "#60706A",
          300: "#A8B4AF",
          100: "#E1E7E4",
        },
        terminal: {
          DEFAULT: "#00FF41",
          soft: "#79FF9B",
          dim: "#16A83B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0, 0, 0, 0.28)",
        terminal:
          "0 0 0 1px rgba(0, 255, 65, 0.14), 0 0 32px rgba(0, 255, 65, 0.08)",
      },
      backgroundImage: {
        "forest-radial":
          "radial-gradient(circle at 50% 0%, rgba(32, 80, 51, 0.55), transparent 46%)",
      },
    },
  },
  plugins: [],
};

export default config;

