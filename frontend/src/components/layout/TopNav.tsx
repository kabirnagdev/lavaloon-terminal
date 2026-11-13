"use client";

import React, { useState, useEffect } from "react";
import {
  Terminal,
  Search,
  Database,
  Clock,
  UploadCloud
} from "lucide-react";
import { HealthStatus, CompanySummary } from "@/types";

interface TopNavProps {
  health: HealthStatus | null;
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  activeModule: string;
  onOpenIngestion?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  health,
  companies,
  selectedCompanyId,
  onSelectCompany,
  activeModule,
  onOpenIngestion
}) => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const activeCompany = companies.find((c) => c.id === selectedCompanyId);
  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getModuleLabel = (mod: string) => {
    switch (mod) {
      case "overview": return "Dashboard";
      case "companies": return "Company Details";
      case "financials": return "Financials & Compare";
      case "research": return "Ask the Data";
      case "diligence": return "Report Export";
      default: return mod;
    }
  };

  return (
    <header className="h-10 bg-terminal-surface terminal-border-b px-3 flex items-center justify-between z-30 select-none font-sans">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Lavaloon Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-xs tracking-tight text-white">Lavaloon</span>
            <span className="text-[10px] text-slate-400 font-normal">Terminal</span>
          </div>
        </div>

        <div className="h-3 w-px bg-terminal-border hidden md:block" />

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500 text-[11px]">Section:</span>
          <span className="text-slate-200 font-medium">{getModuleLabel(activeModule)}</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="relative flex items-center gap-2 max-w-sm w-full mx-3">
        <div className="relative w-full">
          <div className="flex items-center w-full px-2 py-0.5 bg-terminal-bg terminal-border rounded focus-within:border-sky-500/60 transition-colors">
            <Search className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Search ticker, company name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none w-full"
            />
          </div>

          {searchOpen && searchQuery && (
            <div className="absolute top-8 left-0 right-0 bg-terminal-panel terminal-border rounded shadow-xl p-1 z-50 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-2 text-xs text-slate-400">No matching company found</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCompany(c.id);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800/60 rounded flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sky-400 font-mono">{c.ticker}</span>
                      <span className="text-slate-200">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{c.sector}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {activeCompany && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/60 border border-slate-700/60 rounded shrink-0 text-xs font-mono">
            <span className="text-[10px] text-slate-400">ACTIVE:</span>
            <span className="font-bold text-slate-100">{activeCompany.ticker}</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {onOpenIngestion && (
          <button
            onClick={onOpenIngestion}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
            title="Upload CSV dataset"
          >
            <UploadCloud className="w-3 h-3 text-slate-400" />
            <span>Load CSV</span>
          </button>
        )}

        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 px-2 py-0.5 bg-terminal-bg terminal-border rounded">
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="text-[11px] text-slate-300">Clean Data Layer Active</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-terminal-bg terminal-border rounded text-[10px] text-slate-400 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{timeStr || "00:00:00 UTC"}</span>
        </div>
      </div>
    </header>
  );
};
