import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Financial Intelligence & Due Diligence Terminal",
  description: "Institutional financial intelligence workstation combining Knowledge Graphs, GraphRAG, and quantitative derivatives analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: "#070b12", color: "#e2e8f0" }}>
      <body
        className="bg-terminal-bg text-terminal-text overflow-hidden h-screen w-screen flex flex-col"
        style={{ backgroundColor: "#070b12", color: "#e2e8f0" }}
      >
        {children}
      </body>
    </html>
  );
}

