import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      xs: "375px", sm: "640px", md: "768px",
      lg: "1024px", xl: "1280px", "2xl": "1536px",
    },
    extend: {
      colors: {
        brand: {
          50:  "#f0fdf8",
          100: "#ccfbec",
          200: "#9af5d8",
          300: "#5de8be",
          400: "#2dd4a0",
          500: "#10b981",
          600: "#0ea472",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        slate: {
          850: "#1a2535",
          925: "#070f1e",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Geist", "Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px", md: "12px", lg: "16px",
        xl: "20px", "2xl": "24px", "3xl": "32px",
      },
      spacing: {
        nav:  "60px",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      boxShadow: {
        xs:       "0 1px 2px 0 rgb(0 0 0 / .05)",
        sm:       "0 1px 3px 0 rgb(0 0 0 / .08), 0 1px 2px -1px rgb(0 0 0 / .08)",
        DEFAULT:  "0 4px 6px -1px rgb(0 0 0 / .08), 0 2px 4px -2px rgb(0 0 0 / .08)",
        md:       "0 4px 6px -1px rgb(0 0 0 / .08), 0 2px 4px -2px rgb(0 0 0 / .08)",
        lg:       "0 10px 15px -3px rgb(0 0 0 / .08), 0 4px 6px -4px rgb(0 0 0 / .08)",
        xl:       "0 20px 25px -5px rgb(0 0 0 / .08), 0 8px 10px -6px rgb(0 0 0 / .08)",
        "2xl":    "0 25px 50px -12px rgb(0 0 0 / .14)",
        brand:    "0 4px 14px 0 rgb(14 164 114 / .28)",
        "brand-lg":"0 8px 28px 0 rgb(14 164 114 / .35)",
        none:     "none",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #0ea472 0%, #10b981 100%)",
        "gradient-mesh":  "radial-gradient(at 40% 20%, rgb(14 164 114 / .08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(16 185 129 / .05) 0px, transparent 50%)",
        "dot-light":      "radial-gradient(circle, rgb(0 0 0 / .06) 1px, transparent 1px)",
        "dot-dark":       "radial-gradient(circle, rgb(255 255 255 / .05) 1px, transparent 1px)",
      },
      animation: {
        "fade-in":    "fadeIn .25s cubic-bezier(.4,0,.2,1) both",
        "fade-up":    "fadeUp .35s cubic-bezier(.4,0,.2,1) both",
        "fade-down":  "fadeDown .25s cubic-bezier(.4,0,.2,1) both",
        "scale-in":   "scaleIn .2s cubic-bezier(.34,1.56,.64,1) both",
        "slide-right":"slideRight .3s cubic-bezier(.4,0,.2,1) both",
        "shimmer":    "shimmer 2s infinite",
        "spin-slow":  "spin 3s linear infinite",
        "pulse-soft": "pulse 2.5s cubic-bezier(.4,0,.6,1) infinite",
      },
      keyframes: {
        fadeIn:    { from:{ opacity:"0" }, to:{ opacity:"1" } },
        fadeUp:    { from:{ opacity:"0", transform:"translateY(10px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        fadeDown:  { from:{ opacity:"0", transform:"translateY(-8px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        scaleIn:   { from:{ opacity:"0", transform:"scale(.96)" }, to:{ opacity:"1", transform:"scale(1)" } },
        slideRight:{ from:{ opacity:"0", transform:"translateX(-10px)" }, to:{ opacity:"1", transform:"translateX(0)" } },
        shimmer:   { "0%":{ backgroundPosition:"-200% 0" }, "100%":{ backgroundPosition:"200% 0" } },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(.34,1.56,.64,1)",
        smooth: "cubic-bezier(.4,0,.2,1)",
      },
    },
  },
  plugins: [],
};

export default config;
