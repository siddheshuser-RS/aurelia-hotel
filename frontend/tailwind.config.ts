import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noir: "#0B0B0B",
        gold: "#D4AF37",
        ivory: "#F5F5F5",
        ash: "#1A1A1A"
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      backgroundImage: {
        "luxury-gradient": "radial-gradient(circle at top, rgba(212,175,55,0.22), transparent 40%), linear-gradient(180deg, #0B0B0B 0%, #070707 100%)"
      },
      boxShadow: {
        glass: "0 20px 80px rgba(0, 0, 0, 0.35)",
        gold: "0 0 24px rgba(212, 175, 55, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
