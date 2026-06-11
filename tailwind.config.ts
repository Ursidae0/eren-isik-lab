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
          950: "#1d281f",
          900: "#263b2d",
          800: "#36503b",
          700: "#4e654e",
        },
        mist: {
          950: "#1d281f",
          900: "#27332a",
          800: "#3f4c43",
          700: "#526057",
          600: "#738076",
          300: "#c8cdbd",
          100: "#f1efe6",
        },
        terminal: {
          DEFAULT: "#71816c",
          soft: "#9eaa8c",
          dim: "#4e654e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
