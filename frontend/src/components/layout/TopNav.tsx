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
    <header className="h-10 bg-metallic-header border-b border-white/[0.08] px-3 flex items-center justify-between z-30 select-none font-sans shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Lavaloon Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]"
            />
          </div>
          <div className="flex items-baseline gap-1.5 font-display">
            <span className="font-bold text-sm tracking-tight metallic-text">Lavaloon</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Terminal</span>
          </div>
        </div>

        <div className="h-3 w-px bg-white/10 hidden md:block" />

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500 text-[11px]">Section:</span>
          <span className="text-slate-200 font-medium font-display tracking-wide">{getModuleLabel(activeModule)}</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="relative flex items-center gap-2 max-w-sm w-full mx-3">
        <div className="relative w-full">
          <div className="flex items-center w-full px-2.5 py-1 bg-black/40 border border-white/10 rounded-md focus-within:border-sky-500/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] transition-all">
            <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search ticker, company name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none w-full font-sans"
            />
          </div>

          {searchOpen && searchQuery && (
            <div className="absolute top-9 left-0 right-0 metallic-surface rounded-lg shadow-2xl p-1.5 z-50 max-h-60 overflow-y-auto">
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
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white/[0.06] rounded flex items-center justify-between text-xs transition-colors"
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
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 metallic-card-subtle rounded shrink-0 text-xs font-mono">
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
            className="px-2.5 py-1 metallic-pill hover:border-white/20 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Upload CSV dataset"
          >
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-display font-medium text-[11px] tracking-wide">Load CSV</span>
          </button>
        )}

        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 px-2 py-0.5 metallic-card-subtle rounded">
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="text-[11px] text-slate-300">Data Layer Active</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 metallic-card-subtle rounded text-[10px] text-slate-400 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{timeStr || "00:00:00 UTC"}</span>
        </div>
      </div>
    </header>
  );
};
