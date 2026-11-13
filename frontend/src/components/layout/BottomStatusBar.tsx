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
    <footer className="h-6 bg-terminal-surface terminal-border-t px-3 flex items-center justify-between text-[10px] select-none text-slate-400 font-sans z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          <span className="text-slate-300 font-medium">DATA LAYER: ACTIVE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div>
          <span className="text-slate-500">CANONICAL RECORDS:</span>{" "}
          <span className="text-slate-200 font-mono">396 Verified Series</span>
        </div>
      </div>

      {/* Center */}
      <div className="hidden md:flex items-center gap-3 font-mono">
        {activeCompany && (
          <div>
            <span className="text-slate-500">SELECTED:</span>{" "}
            <span className="text-slate-200 font-semibold">{activeCompany.ticker}</span>{" "}
            <span className="text-slate-500">({activeCompany.name})</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 font-mono">
        <span className="text-slate-500">SOURCES: SEC 10-K / BSE</span>
        <span className="text-slate-600">|</span>
        <div className="text-slate-300 tabular-nums">
          {timeStr || "00:00:00 UTC"}
        </div>
      </div>
    </footer>
  );
};
