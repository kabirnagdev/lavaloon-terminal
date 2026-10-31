"use client";

import React, { useState } from "react";
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
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-12" : "w-52"
      } bg-terminal-surface terminal-border-r flex flex-col justify-between shrink-0 select-none transition-all duration-150`}
    >
      <div className="py-2">
        <div className="px-2.5 pb-2 flex items-center justify-between">
          {!collapsed && (
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Workstation
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors ml-auto"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <nav className="space-y-0.5 px-1.5">
          {MODULES.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                title={collapsed ? `${item.label} (${item.hotkey})` : undefined}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-1.5" : "justify-between px-2"
                } py-1.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-slate-100 border border-slate-700/80 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-sky-400" : "text-slate-500"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && (
                  <span className="text-[9px] text-slate-500 font-mono px-1 py-0.2 rounded bg-slate-900 border border-slate-800 shrink-0">
                    {item.hotkey}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
