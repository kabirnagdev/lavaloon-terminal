"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Share2,
  Brain,
  FileCheck2,
  Calculator,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Server
} from "lucide-react";

interface SidebarProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
}

const MODULES = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, hotkey: "F1" },
  { id: "companies", label: "Entity Explorer", icon: Building2, hotkey: "F2" },
  { id: "financials", label: "Financial Intel", icon: TrendingUp, hotkey: "F3" },
  { id: "graph", label: "Knowledge Graph", icon: Share2, hotkey: "F4" },
  { id: "research", label: "GraphRAG Copilot", icon: Brain, hotkey: "F5" },
  { id: "diligence", label: "Due Diligence", icon: FileCheck2, hotkey: "F6" },
  { id: "quant", label: "Options Desk", icon: Calculator, hotkey: "F7" },
  { id: "settings", label: "System Config", icon: Sliders, hotkey: "F8" }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  return (
    <aside className="w-56 bg-terminal-surface terminal-border-r flex flex-col justify-between shrink-0 select-none">
      <div className="py-2.5">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
          Workstation Navigation
        </div>
        <nav className="space-y-0.5 px-2">
          {MODULES.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800/80 text-sky-400 border border-slate-700/70 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-sky-400" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-mono px-1 py-0.2 rounded bg-slate-900 border border-slate-800">
                    {item.hotkey}
                  </span>
                  {isActive && <ChevronRight className="w-3 h-3 text-sky-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
