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
          bg: "#070a10",
          surface: "#0e131d",
          panel: "#131926",
          panelLight: "#1b2335",
          hover: "#1e273d",
          border: "#20283c",
          borderLight: "#2c3852",
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
        },
        metallic: {
          steel: "#1a2233",
          titanium: "#121722",
          gunmetal: "#0b0f17",
          charcoal: "#06080d",
          highlight: "rgba(255, 255, 255, 0.12)",
          border: "rgba(255, 255, 255, 0.08)",
          borderMuted: "rgba(255, 255, 255, 0.04)"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["'Space Grotesk'", "'Syne'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "SF Mono", "Menlo", "Consolas", "monospace"]
      },
      backgroundImage: {
        'metallic-canvas': "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(42, 54, 78, 0.4) 0%, transparent 70%), radial-gradient(circle 700px at 85% 15%, rgba(65, 80, 115, 0.15) 0%, transparent 60%), linear-gradient(180deg, #0d111a 0%, #06080d 100%)",
        'metallic-card': "linear-gradient(160deg, rgba(23, 29, 41, 0.8) 0%, rgba(11, 15, 23, 0.88) 100%)",
        'metallic-pill': "linear-gradient(180deg, rgba(46, 56, 77, 0.65) 0%, rgba(19, 24, 35, 0.85) 100%)",
        'metallic-pill-active': "linear-gradient(180deg, rgba(58, 70, 95, 0.85) 0%, rgba(27, 34, 48, 0.95) 100%)",
        'metallic-header': "linear-gradient(180deg, rgba(18, 23, 33, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)",
      },
      boxShadow: {
        'metallic-card': "0 8px 24px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 0 rgba(0, 0, 0, 0.6)",
        'metallic-pill': "0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.18)",
        'metallic-glow': "0 0 25px -5px rgba(56, 189, 248, 0.25)",
      }
    },
  },
  plugins: [],
};
