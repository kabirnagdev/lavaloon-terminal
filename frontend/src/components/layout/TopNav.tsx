"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Terminal,
  Search,
  Database,
  Cpu,
  Layers,
  Clock,
  Sparkles
} from "lucide-react";
import { HealthStatus, CompanySummary } from "@/types";

interface TopNavProps {
  health: HealthStatus | null;
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  activeModule: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  health,
  companies,
  selectedCompanyId,
  onSelectCompany,
  activeModule
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

  return (
    <header className="h-11 bg-terminal-surface terminal-border-b px-4 flex items-center justify-between z-30 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs tracking-tight text-white">LAVALOON</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60 text-sky-400 font-medium">
              TERMINAL
            </span>
          </div>
        </div>

        <div className="h-3.5 w-px bg-terminal-border mx-0.5 hidden md:block" />

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500 text-[11px]">Workspace:</span>
          <span className="text-slate-200 capitalize font-medium">{activeModule}</span>
        </div>
      </div>

      {/* Center Search / Instrument Indicator */}
      <div className="relative flex items-center gap-2 max-w-md w-full mx-4">
        <div className="relative w-full">
          <div className="flex items-center w-full px-2.5 py-1 bg-terminal-bg terminal-border rounded-md focus-within:border-sky-500/50 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search instruments, filings, ontology entities..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none w-full"
            />
            <span className="text-[10px] font-mono text-slate-500 px-1 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
              /
            </span>
          </div>

          {searchOpen && searchQuery && (
            <div className="absolute top-10 left-0 right-0 bg-terminal-panel terminal-border rounded-lg shadow-2xl p-1 z-50 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-2.5 text-xs text-slate-400">No matching instrument or entity found</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCompany(c.id);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800/60 rounded-md flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sky-400">{c.ticker}</span>
                      <span className="text-slate-200">{c.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{c.sector}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {activeCompany && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/40 border border-slate-700/50 rounded shrink-0 text-xs">
            <span className="text-[10px] text-slate-500 uppercase">Focus:</span>
            <span className="font-mono font-semibold text-slate-200">
              {activeCompany.ticker}
            </span>
          </div>
        )}
      </div>

      {/* Right Telemetry & Health */}
      <div className="flex items-center gap-2.5">
        {/* Knowledge Graph Telemetry */}
        {health && (
          <div className="hidden xl:flex items-center gap-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5" title="Dataset Records Count">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono tabular-nums text-slate-300">{health.records_count}</span>
              <span className="text-[10px] text-slate-500">records</span>
            </div>
            <div className="flex items-center gap-1.5" title="Graph Nodes / Edges">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono tabular-nums text-slate-300">{health.graph_nodes}N</span>
              <span className="text-slate-600">/</span>
              <span className="font-mono tabular-nums text-slate-300">{health.graph_edges}E</span>
            </div>
          </div>
        )}

        {/* System Time */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-terminal-bg terminal-border rounded text-[11px] text-slate-400 font-mono tabular-nums">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{timeStr || "00:00:00 UTC"}</span>
        </div>
      </div>
    </header>
  );
};
