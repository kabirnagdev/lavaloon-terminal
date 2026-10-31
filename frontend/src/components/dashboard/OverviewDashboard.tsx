"use client";

import React from "react";
import {
  TrendingUp,
  Share2,
  Brain,
  ShieldAlert,
  ArrowUpRight,
  Database,
  Building2,
  FileCheck2,
  Activity,
  Layers,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { CompanySummary, HealthStatus } from "@/types";

interface OverviewDashboardProps {
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  onNavigate: (module: string) => void;
  health: HealthStatus | null;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onNavigate,
  health
}) => {
  const activeCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-terminal-bg overflow-y-auto p-3 space-y-2.5 select-text">
      {/* Top Banner */}
      <div className="p-2.5 px-3 bg-terminal-surface terminal-border rounded-md flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-semibold text-white tracking-tight uppercase">
              Financial Intelligence & Due Diligence Terminal
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
              v2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Knowledge Graph Ontology & Hybrid GraphRAG Research Workstation
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <button
            onClick={() => onNavigate("research")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono rounded flex items-center gap-1.5 transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-slate-400" />
            <span>Copilot Query</span>
          </button>
          <button
            onClick={() => onNavigate("graph")}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 font-mono rounded flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Explore Graph</span>
          </button>
        </div>
      </div>

      {/* High Density Metric Cards (Uniform Monochromatic Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-2.5 bg-terminal-surface terminal-border rounded-md space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <span>Survey Records</span>
            <div className="p-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
              <Database className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-100 tabular-nums">
            {health?.records_count ?? 40}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Empirical Responses
          </div>
        </div>

        <div className="p-2.5 bg-terminal-surface terminal-border rounded-md space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <span>Ontology Entities</span>
            <div className="p-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
              <Layers className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-100 tabular-nums">
            {health?.graph_nodes ?? 147}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Extracted Attributes & Nodes
          </div>
        </div>

        <div className="p-2.5 bg-terminal-surface terminal-border rounded-md space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <span>Statistical Correlations</span>
            <div className="p-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
              <Share2 className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-100 tabular-nums">
            {health?.association_edges ?? 184}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Lift &ge; 1.5 Associations
          </div>
        </div>

        <div className="p-2.5 bg-terminal-surface terminal-border rounded-md space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <span>Semantic Index</span>
            <div className="p-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
              <Activity className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xs font-semibold font-mono text-slate-200 truncate pt-1">
            {health?.embedding_backend || "all-MiniLM-L6-v2"}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Hybrid Vector + BFS
          </div>
        </div>
      </div>

      {/* Main Grid: Active Focus Profile & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Active Entity Card */}
        <div className="lg:col-span-2 p-3 bg-terminal-surface terminal-border rounded-md space-y-2">
          <div className="flex items-center justify-between border-b border-terminal-border/80 pb-2">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Featured Asset Class / Instrument
              </span>
            </div>
            {activeCompany && (
              <span className="text-[10px] font-mono font-semibold text-slate-300 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                {activeCompany.ticker}
              </span>
            )}
          </div>

          {activeCompany && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  {activeCompany.name}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  {activeCompany.sector}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-normal">
                {activeCompany.description}
              </p>

              <div className="pt-1 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => onNavigate("companies")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 font-mono text-xs transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onNavigate("diligence")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 font-mono text-xs transition-colors flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3 h-3 text-slate-400" />
                  <span>Due Diligence Analysis</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Research Jump */}
        <div className="p-3 bg-terminal-surface terminal-border rounded-md space-y-2">
          <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-terminal-border/80 pb-2">
            <Brain className="w-3.5 h-3.5 text-slate-400" />
            <span>GraphRAG Research Queries</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <button
              onClick={() => onNavigate("research")}
              className="w-full text-left py-1.5 px-2 bg-terminal-panel hover:bg-slate-800/80 terminal-border rounded text-slate-300 hover:text-white transition-colors flex items-center justify-between group"
            >
              <span className="text-[11px] truncate">What kind of investors prefer Mutual Funds?</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0 ml-1.5" />
            </button>
            <button
              onClick={() => onNavigate("research")}
              className="w-full text-left py-1.5 px-2 bg-terminal-panel hover:bg-slate-800/80 terminal-border rounded text-slate-300 hover:text-white transition-colors flex items-center justify-between group"
            >
              <span className="text-[11px] truncate">How many respondents are male and what is their choice?</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0 ml-1.5" />
            </button>
            <button
              onClick={() => onNavigate("research")}
              className="w-full text-left py-1.5 px-2 bg-terminal-panel hover:bg-slate-800/80 terminal-border rounded text-slate-300 hover:text-white transition-colors flex items-center justify-between group"
            >
              <span className="text-[11px] truncate">What savings objectives link to Bonds versus Equity?</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
