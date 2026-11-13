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
      } bg-terminal-surface terminal-border-r flex flex-col justify-between shrink-0 select-none transition-all duration-150`}
    >
      <div className="py-2.5">
        <div className="px-3 pb-2 flex items-center justify-between border-b border-terminal-border/40 mb-1.5">
          {!collapsed && (
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Navigation
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
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-1.5" : "justify-start px-2.5"
                } py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-slate-100 font-semibold border border-slate-700/80"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-sky-400" : "text-slate-500"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="p-3 border-t border-terminal-border/40 text-[10px] text-slate-500 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Lavaloon Logo" className="w-5 h-5 object-contain shrink-0" />
          <div className="truncate">
            <div className="text-slate-300 font-medium truncate">Lavaloon Terminal</div>
            <div className="text-slate-500 text-[9px] truncate">Audited Filings Data Layer</div>
          </div>
        </div>
      )}
    </aside>
  );
};
