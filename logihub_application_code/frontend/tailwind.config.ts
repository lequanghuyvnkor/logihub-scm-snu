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
        background: "var(--background)",
        foreground: "var(--foreground)",
        maersk: {
          blue: "#42B0D5",
          navy: "#00243D",
          light: "#E1EDF2",
          gray: "#F2F2F2",
          darkgray: "#333333"
        }
      },
    },
  },
  plugins: [],
};
export default config;

