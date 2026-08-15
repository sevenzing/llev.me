import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07060c",
        cream: "#f4f0ea",
        grape: "#8c70fa",
        warn: "#f0a070",
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', "monospace"],
        display: ['"Major Mono Display"', "monospace"],
      },
      keyframes: {
        "mine-pulse": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "mine-pulse": "mine-pulse 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
