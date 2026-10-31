"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Share2,
  FileSpreadsheet,
  ArrowUpRight
} from "lucide-react";
import { api } from "@/services/api";
import { CompanySummary, CompanyDetail, RelationshipNode } from "@/types";

interface CompanyExplorerProps {
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  onNavigateToDiligence?: (id: string) => void;
}

export const CompanyExplorer: React.FC<CompanyExplorerProps> = ({
  selectedCompanyId,
  onSelectCompany,
  onNavigateToDiligence
}) => {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [activeCompany, setActiveCompany] = useState<CompanyDetail | null>(null);
  const [relationships, setRelationships] = useState<RelationshipNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    api.getCompanies()
      .then((data) => {
        setCompanies(data);
        if (data.length > 0 && !selectedCompanyId) {
          onSelectCompany(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) return;
    api.getCompany(selectedCompanyId)
      .then(setActiveCompany)
      .catch(console.error);

    api.getRelationships(selectedCompanyId)
      .then(setRelationships)
      .catch(console.error);
  }, [selectedCompanyId]);

  const filtered = companies.filter((c) => {
    if (filterType === "all") return true;
    return c.coverage_type === filterType;
  });

  return (
    <div className="flex h-full w-full bg-terminal-bg select-text">
      {/* Left Entity Catalog */}
      <div className="w-80 bg-terminal-surface terminal-border-r flex flex-col h-full shrink-0">
        <div className="h-11 bg-terminal-panel terminal-border-b px-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Instruments & Entities</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-300 px-2 py-0.5 rounded text-[11px] focus:outline-none"
          >
            <option value="all">All Entities</option>
            <option value="survey_investment_avenue">Survey Avenues</option>
            <option value="corporate_equity">Equity Benchmarks</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/50">
          {filtered.map((c) => {
            const isSelected = c.id === selectedCompanyId;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCompany(c.id)}
                className={`w-full text-left p-3 hover:bg-slate-800/40 transition-colors ${
                  isSelected ? "bg-slate-800/70 border-l-2 border-sky-400" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-sky-400">{c.ticker}</span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                      c.coverage_type === "corporate_equity"
                        ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        : "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                    }`}
                  >
                    {c.coverage_type === "corporate_equity" ? "Benchmark" : "Survey Ave"}
                  </span>
                </div>
                <div className="text-xs text-white font-medium mt-1 truncate">
                  {c.name}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{c.sector}</span>
                  <span className="text-amber-400 font-mono text-[10px]">{c.risk_level.split(" ")[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Profile & Financial Intelligence Panel */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        {activeCompany ? (
          <>
            {/* Header Profile Bar */}
            <div className="bg-terminal-surface terminal-border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-sky-400">
                    {activeCompany.ticker}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {activeCompany.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                    {activeCompany.period}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  {activeCompany.description}
                </p>
              </div>

              {onNavigateToDiligence && (
                <button
                  onClick={() => onNavigateToDiligence(activeCompany.id)}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-md text-xs text-sky-400 font-medium flex items-center gap-1.5 self-start md:self-auto transition-colors"
                >
                  <span>Due Diligence Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Financial & Empirical Metrics Grid */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center justify-between">
                <span>Observed & Reported Financial Metrics</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Source: {activeCompany.source_attribution}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeCompany.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-terminal-surface terminal-border rounded-lg p-3 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono">{m.period}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                            m.is_audited
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          }`}
                        >
                          {m.is_audited ? "Audited 10-K" : "Empirical Survey"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-1.5 truncate" title={m.name}>
                        {m.name}
                      </div>
                    </div>

                    <div className="text-base font-bold font-mono text-white truncate tabular-nums">
                      {m.value}
                    </div>

                    <div className="text-[10px] text-slate-500 truncate" title={m.source}>
                      Ref: {m.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Overview & Strategic Parameters */}
            <div className="bg-terminal-surface terminal-border rounded-lg p-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Portfolio Allocation Dynamics & Risk Attributes
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {Object.entries(activeCompany.market_overview).map(([k, v], i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-md">
                    <span className="text-slate-400 text-xs capitalize">
                      {k.replace(/_/g, " ")}:
                    </span>
                    <span className="text-slate-200 font-medium text-xs">
                      {Array.isArray(v) ? v.join(", ") : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Counterparties & Statistical Lift Associations */}
            <div className="bg-terminal-surface terminal-border rounded p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-terminal-dim uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-terminal-cyan" />
                  <span>ONTOLOGY RELATIONSHIPS & CO-OCCURRENCE TIES</span>
                </div>
                <span className="text-[10px] text-terminal-muted">
                  {relationships.length} Identified Connections
                </span>
              </div>

              {relationships.length === 0 ? (
                <div className="text-xs text-terminal-dim p-4 text-center">
                  No direct ontology ties registered in the current active subgraph.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {relationships.map((rel, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-terminal-panel terminal-border rounded flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-terminal-cyan" />
                        <span className="text-terminal-text font-bold truncate max-w-[180px]">
                          {rel.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-terminal-dim uppercase">{rel.relation}</span>
                        {rel.lift && (
                          <span className="text-terminal-amber font-bold">{rel.lift}x lift</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-xs font-mono text-terminal-dim">
            SELECT AN ENTITY FROM THE ROSTER
          </div>
        )}
      </div>
    </div>
  );
};

