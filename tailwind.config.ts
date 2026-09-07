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
        stitch: {
          primary: "#1B4332",       // Deep neem / agricultural green
          "primary-hover": "#2D6A4F", // Supporting field green
          field: "#2D6A4F",
          ochre: "#B45309",         // Restrained ochre/mustard
          "ochre-dark": "#92400E",
          page: "#F4F1EA",          // Warm parchment page background
          surface: "#FFFFFF",       // White card surface
          muted: "#ECE7DE",         // Muted surface
          subtle: "#F9F8F5",        // Subtle warm tint
          text: "#262320",          // Deep charcoal text
          "text-muted": "#5A554E",  // Secondary text
          "text-subtle": "#7C766D", // Tertiary text
          border: "#D8D2C4",        // Crisp 1px border
          "border-subtle": "#E8E3D8",
          // Trust semantic badges
          "verified-bg": "#EAF2ED",
          "verified-text": "#1B4332",
          "verified-border": "#B7D5C4",
          "provisional-bg": "#FEF3C7",
          "provisional-text": "#92400E",
          "provisional-border": "#FDE68A",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Noto Sans", "Noto Sans Devanagari", "Noto Sans Telugu", "system-ui", "sans-serif"],
      },
      borderRadius: {
        btn: "4px",
        card: "8px",
        input: "4px",
      },
      boxShadow: {
        crisp: "0 1px 2px 0 rgba(38, 35, 32, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
