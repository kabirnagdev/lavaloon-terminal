/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#0a0d14",
          surface: "#0f1420",
          panel: "#151b2a",
          panelLight: "#1c2438",
          hover: "#1e273d",
          border: "#212a3e",
          borderLight: "#2d3954",
          cyan: "#38bdf8",
          cyanMuted: "#0284c7",
          blue: "#3b82f6",
          amber: "#f59e0b",
          green: "#10b981",
          red: "#f43f5e",
          text: "#f8fafc",
          textSecondary: "#cbd5e1",
          muted: "#94a3b8",
          dim: "#64748b"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "Consolas", "monospace"]
      }
    },
  },
  plugins: [],
};
