import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lavaloon Terminal — Financial Intelligence Workstation",
  description: "Audited financial analysis, multi-statement comparisons, and grounded filings research.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/icon.png?v=2", type: "image/png" },
      { url: "/logo.png?v=2", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: "#070b12", color: "#e2e8f0" }}>
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />
      </head>
      <body
        className="bg-terminal-bg text-terminal-text overflow-hidden h-screen w-screen flex flex-col"
        style={{ backgroundColor: "#070b12", color: "#e2e8f0" }}
      >
        {children}
      </body>
    </html>
  );
}

