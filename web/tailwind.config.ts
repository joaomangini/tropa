import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pasto: "#3a6b3d",
        "pasto-hondo": "#274a2b",
        crema: "#f4efe4",
        "crema-2": "#ece4d3",
        tierra: "#a8482b",
        ambar: "#c68a24",
        tinta: "#21241c",
        humo: "#6b6d5d",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
