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
        "ring-pulse": {
          "0%": { transform: "scale(0.78)", opacity: "0.9" },
          "70%": { opacity: "0.3" },
          "100%": { transform: "scale(1.85)", opacity: "0" },
        },
        "shimmer-sweep": {
          "0%": { transform: "translateX(-130%) skewX(-12deg)" },
          "100%": { transform: "translateX(130%) skewX(-12deg)" },
        },
        "pop-bounce": {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.055)" },
          "65%": { transform: "scale(0.985)" },
          "100%": { transform: "scale(1)" },
        },
        "spark-fly": {
          "0%": { transform: "translate(-50%, -50%) translate(0, 0) scale(1)", opacity: "1" },
          "100%": {
            transform: "translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0)",
            opacity: "0",
          },
        },
        "check-pop": {
          "0%": { transform: "scale(0.4) rotate(-8deg)", opacity: "0" },
          "60%": { transform: "scale(1.12) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "modal-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "modal-pop-in": {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "mine-pulse": "mine-pulse 1.2s ease-in-out infinite",
        "ring-pulse": "ring-pulse 900ms cubic-bezier(0.16,1,0.3,1) forwards",
        "shimmer-sweep": "shimmer-sweep 900ms ease-in-out forwards",
        "pop-bounce": "pop-bounce 600ms cubic-bezier(0.34,1.56,0.64,1) forwards",
        "spark-fly": "spark-fly 700ms cubic-bezier(0.16,1,0.3,1) forwards",
        "check-pop": "check-pop 500ms cubic-bezier(0.34,1.56,0.64,1) forwards",
        "modal-fade-in": "modal-fade-in 200ms ease-out forwards",
        "modal-pop-in": "modal-pop-in 320ms cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
