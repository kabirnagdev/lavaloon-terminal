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
    <div className="flex-1 flex flex-col h-full bg-terminal-bg overflow-y-auto p-4 space-y-4 select-text">
      {/* Top Welcome & System Pulse Banner */}
      <div className="p-4 bg-terminal-surface terminal-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse" />
            <h1 className="text-sm font-semibold text-white tracking-tight">
              Financial Intelligence & Due Diligence Terminal
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono">
              v2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Institutional workstation unifying empirical survey intelligence, knowledge graph ontologies,
            multi-hop GraphRAG reasoning, and quantitative derivatives analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 text-xs">
          <button
            onClick={() => onNavigate("research")}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium rounded-md flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Copilot Query</span>
          </button>
          <button
            onClick={() => onNavigate("graph")}
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Explore Graph</span>
          </button>
        </div>
      </div>

      {/* High Density Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-terminal-surface terminal-border rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Survey Records</span>
            <div className="p-1 rounded bg-sky-500/10 text-sky-400">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {health?.records_count ?? 40}
          </div>
          <div className="text-[11px] text-slate-400">
            Empirical Investor Responses
          </div>
        </div>

        <div className="p-3.5 bg-terminal-surface terminal-border rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Ontology Entities</span>
            <div className="p-1 rounded bg-amber-500/10 text-amber-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
            {health?.graph_nodes ?? 147}
          </div>
          <div className="text-[11px] text-slate-400">
            Extracted Attributes & Nodes
          </div>
        </div>

        <div className="p-3.5 bg-terminal-surface terminal-border rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Statistical Correlations</span>
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <Share2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
            {health?.association_edges ?? 184}
          </div>
          <div className="text-[11px] text-slate-400">
            Lift &ge; 1.5 Statistical Ties
          </div>
        </div>

        <div className="p-3.5 bg-terminal-surface terminal-border rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Semantic Index</span>
            <div className="p-1 rounded bg-sky-500/10 text-sky-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-semibold font-mono text-sky-300 truncate pt-1">
            {health?.embedding_backend || "all-MiniLM-L6-v2"}
          </div>
          <div className="text-[11px] text-slate-400">
            Hybrid Vector + Multi-Hop BFS
          </div>
        </div>
      </div>

      {/* Main Grid: Active Focus Profile & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Entity Card */}
        <div className="lg:col-span-2 p-4 bg-terminal-surface terminal-border rounded-lg space-y-3">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Featured Asset Class / Instrument
              </span>
            </div>
            {activeCompany && (
              <span className="text-xs font-mono font-semibold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                {activeCompany.ticker}
              </span>
            )}
          </div>

          {activeCompany && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  {activeCompany.name}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-medium">
                  {activeCompany.sector}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeCompany.description}
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => onNavigate("companies")}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-md text-sky-400 font-medium transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onNavigate("diligence")}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-md text-slate-200 font-medium transition-colors flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due Diligence Analysis</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Research Jump */}
        <div className="p-4 bg-terminal-surface terminal-border rounded-lg space-y-3">
          <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5 border-b border-terminal-border pb-2.5">
            <Brain className="w-4 h-4 text-sky-400" />
            <span>GraphRAG Research Queries</span>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => onNavigate("research")}
              className="w-full text-left p-2.5 bg-terminal-panel hover:bg-slate-800/80 terminal-border rounded-md text-slate-300 hover:text-sky-300 transition-colors flex items-center justify-between group"
            >
              <span>What kind of investors prefer Mutual Funds?</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
            </button>
            <button
              onClick={() => onNavigate("research")}
              className="w-full text-left p-2.5 bg-terminal-panel hover:bg-slate-800/80 terminal-border rounded-md text-slate-300 hover:text-sky-300 transition-colors flex items-center justify-between group"
            >
              <span>How many respondents are male and what is their choice?</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
            </button>
            <button
              onClick={() => onNavigate("research")}
              className="w-full text-left p-2.5 bg-terminal-panel hover:bg-slate-800/80 terminal-border rounded-md text-slate-300 hover:text-sky-300 transition-colors flex items-center justify-between group"
            >
              <span>What savings objectives link to Bonds versus Equity?</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
