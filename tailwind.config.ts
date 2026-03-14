import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentStrong: "rgb(var(--accent-strong) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      boxShadow: {
        panel: "0 22px 52px rgba(10, 34, 60, 0.12)",
        halo: "0 0 0 1px rgba(26, 120, 96, 0.2), 0 16px 48px rgba(8, 43, 77, 0.14)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(32, 142, 113, 0.2), transparent 44%), radial-gradient(circle at 82% 12%, rgba(66, 159, 125, 0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(24, 108, 86, 0.14), transparent 36%)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "-apple-system", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
        xs: ["0.75rem", { lineHeight: "1.125rem", letterSpacing: "0.01em" }],
        sm: ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "-0.003em" }],
        base: ["0.9375rem", { lineHeight: "1.5625rem", letterSpacing: "-0.005em" }],
        lg: ["1.0625rem", { lineHeight: "1.625rem", letterSpacing: "-0.007em" }],
        xl: ["1.1875rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "2xl": ["1.375rem", { lineHeight: "1.875rem", letterSpacing: "-0.015em" }],
        "3xl": ["1.625rem", { lineHeight: "2rem", letterSpacing: "-0.018em" }],
        "4xl": ["2rem", { lineHeight: "2.375rem", letterSpacing: "-0.022em" }],
        "5xl": ["2.5rem", { lineHeight: "2.875rem", letterSpacing: "-0.025em" }],
        "6xl": ["3rem", { lineHeight: "3.375rem", letterSpacing: "-0.03em" }],
      },
    },
  },
  plugins: [],
};

export default config;
