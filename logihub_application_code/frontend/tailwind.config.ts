import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#FAFAFA",
        logihub: {
          900: "#0A0A0A",
          800: "#121212",
          700: "#1A1A1A",
          dark: "#0F1115",
          panel: "#161920",
          border: "#2A2E39",
          neon: "#00E5FF",
          violet: "#8A2BE2",
          success: "#00E676",
          warning: "#FFEA00",
          danger: "#FF1744"
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #8A2BE222 0deg, #00E5FF22 180deg, #8A2BE222 360deg)',
      },
    },
  },
  plugins: [],
};
export default config;
