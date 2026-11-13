"use client";

import React, { useState, useEffect } from "react";
import { HealthStatus, CompanySummary } from "@/types";

interface BottomStatusBarProps {
  health: HealthStatus | null;
  activeCompany?: CompanySummary;
  activeModule: string;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  health,
  activeCompany,
  activeModule
}) => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }) + " UTC"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-6 bg-metallic-header border-t border-white/[0.08] px-3 flex items-center justify-between text-[10px] select-none text-slate-400 font-sans z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-slate-300 font-display font-medium text-[9px] tracking-wider uppercase">Data Layer: Active</span>
        </div>
        <span className="text-white/10">|</span>
        <div className="font-mono text-[9px]">
          <span className="text-slate-500 uppercase tracking-wider">Canonical:</span>{" "}
          <span className="text-slate-200 font-semibold">396 Verified Series</span>
        </div>
      </div>

      {/* Center */}
      <div className="hidden md:flex items-center gap-3 font-mono text-[10px]">
        {activeCompany && (
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[9px]">Selected:</span>{" "}
            <span className="text-sky-300 font-semibold">{activeCompany.ticker}</span>{" "}
            <span className="text-slate-400">({activeCompany.name})</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 font-mono text-[10px]">
        <span className="text-slate-400 text-[9px] tracking-wider uppercase">SEC Form 10-K &bull; BSE Filings</span>
        <span className="text-white/10">|</span>
        <div className="text-slate-300 tabular-nums">
          {timeStr || "00:00:00 UTC"}
        </div>
      </div>
    </footer>
  );
};
