"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Share2,
  MessageSquare,
  FileText,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

interface SidebarProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
}

const MODULES = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "companies", label: "Company", icon: Building2 },
  { id: "financials", label: "Financials & Compare", icon: TrendingUp },
  { id: "graph", label: "Relationship Graph", icon: Share2 },
  { id: "research", label: "Ask the data", icon: MessageSquare },
  { id: "diligence", label: "Report export", icon: FileText }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-12" : "w-48"
      } bg-black/40 backdrop-blur-xl border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none transition-all duration-150 z-20`}
    >
      <div className="py-2.5">
        <div className="px-3 pb-2 flex items-center justify-between border-b border-white/[0.06] mb-1.5">
          {!collapsed && (
            <span className="text-[10px] font-display font-semibold tracking-wider text-slate-400 uppercase">
              Navigation
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors ml-auto cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <nav className="space-y-1 px-1.5">
          {MODULES.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-1.5" : "justify-start px-2.5"
                } py-2 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? "metallic-pill-active text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-sky-300" : "text-slate-500"
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate font-display font-medium text-[11px] tracking-wide">
                      {item.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="p-2.5 border-t border-white/[0.06] text-[10px] text-slate-500 flex items-center gap-2.5 metallic-card-subtle mx-2 mb-2 rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Lavaloon Logo" className="w-5 h-5 object-contain shrink-0 drop-shadow-[0_0_6px_rgba(56,189,248,0.25)]" />
          <div className="truncate">
            <div className="text-slate-200 font-display font-semibold text-[11px] tracking-tight truncate">Lavaloon Terminal</div>
            <div className="text-slate-400 text-[9px] tracking-wider uppercase font-mono truncate">Audited Filings Engine</div>
          </div>
        </div>
      )}
    </aside>
  );
};
