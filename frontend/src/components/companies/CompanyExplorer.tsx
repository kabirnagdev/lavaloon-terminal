"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  TrendingUp,
  Share2,
  FileCheck2,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight
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
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    const matchesFilter = filterType === "all" || c.coverage_type === filterType;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-full w-full bg-terminal-bg select-text font-sans overflow-hidden">
      {/* REGION 1: LEFT ENTITY ROSTER */}
      <div className="w-72 bg-terminal-surface terminal-border-r flex flex-col h-full shrink-0">
        {/* Search & Filter Header */}
        <div className="p-2.5 bg-terminal-panel terminal-border-b space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-white font-mono uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Entity Directory</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">
              {filtered.length} / {companies.length}
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search ticker, name, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-terminal-bg terminal-border rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 font-mono"
            />
          </div>

          {/* Category Classification Selector */}
          <div className="flex gap-1 text-[10px] font-mono">
            <button
              onClick={() => setFilterType("all")}
              className={`flex-1 py-1 rounded transition-colors ${
                filterType === "all"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              All ({companies.length})
            </button>
            <button
              onClick={() => setFilterType("corporate_equity")}
              className={`flex-1 py-1 rounded transition-colors ${
                filterType === "corporate_equity"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Corporations
            </button>
            <button
              onClick={() => setFilterType("survey_investment_avenue")}
              className={`flex-1 py-1 rounded transition-colors ${
                filterType === "survey_investment_avenue"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Survey Avenues
            </button>
          </div>
        </div>

        {/* Entity List */}
        <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/40 font-mono">
          {filtered.map((c) => {
            const isSelected = c.id === selectedCompanyId;
            const isCorporate = c.coverage_type === "corporate_equity";
            return (
              <button
                key={c.id}
                onClick={() => onSelectCompany(c.id)}
                className={`w-full text-left p-2.5 hover:bg-slate-800/40 transition-colors ${
                  isSelected ? "bg-slate-800/80 border-l-2 border-sky-400" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-100">{c.ticker}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {isCorporate ? "SEC/BSE FILER" : "SURVEY VENUE"}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-sans truncate mt-0.5">
                  {c.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span className="truncate">{c.sector}</span>
                  <span>{c.country || "Global"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* REGION 2: CENTER COMPANY DOSSIER */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-3 space-y-2.5">
        {activeCompany ? (
          <>
            {/* Header Profile Bar */}
            <div className="bg-terminal-surface terminal-border rounded p-3 flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-sm font-bold text-white px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                    {activeCompany.ticker}
                  </span>
                  <h1 className="text-base font-bold text-white font-sans tracking-tight">
                    {activeCompany.name}
                  </h1>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                    {activeCompany.period}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Sector: <span className="text-slate-200">{activeCompany.sector}</span> &bull; Industry: <span className="text-slate-200">{activeCompany.industry}</span> &bull; Risk: <span className="text-slate-300">{activeCompany.risk_level}</span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
                  {activeCompany.description}
                </p>
              </div>

              {onNavigateToDiligence && (
                <button
                  onClick={() => onNavigateToDiligence(activeCompany.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-mono text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due Diligence Dossier &rarr;</span>
                </button>
              )}
            </div>

            {/* Core Financial Metrics Grid */}
            <div className="space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                <span>Audited Financial & Operational Highlights</span>
                <span className="text-slate-500 font-normal">
                  Source: {activeCompany.source_attribution}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {activeCompany.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-terminal-surface terminal-border rounded p-2 flex flex-col justify-between space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{m.period}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {m.is_audited ? "Audited" : "Empirical"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 truncate" title={m.name}>
                      {m.name}
                    </div>

                    <div className="text-base font-bold text-slate-100 tabular-nums">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Segments Breakdown (if available) */}
            {activeCompany.segments && Object.keys(activeCompany.segments).length > 0 && (
              <div className="bg-terminal-surface terminal-border rounded p-3 space-y-2 font-mono">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Revenue Breakdown by Business Segment (Audited Form 10-K / Annual Report)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(activeCompany.segments).map(([seg, rev], i) => (
                    <div key={i} className="p-2 bg-slate-900/60 border border-slate-800 rounded flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-sans">{seg}</span>
                      <span className="text-slate-100 font-bold tabular-nums">
                        {activeCompany.currency === "USD" ? `$${(rev / 1e9).toFixed(2)}B` : `₹${rev.toLocaleString()} Cr`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclosed Risk Factors & Contingencies */}
            {activeCompany.risks && activeCompany.risks.length > 0 && (
              <div className="bg-terminal-surface terminal-border rounded p-3 space-y-2 font-mono">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span>Item 1A Risk Factors & Official Disclosures</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-sans">
                  {activeCompany.risks.map((risk, i) => (
                    <div key={i} className="p-2 bg-slate-900/60 border border-slate-800 rounded flex items-start gap-2">
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5 shrink-0">#{i + 1}</span>
                      <span className="text-slate-300 leading-relaxed">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-xs font-mono text-slate-500">
            SELECT AN ENTITY FROM THE ROSTER TO INSPECT
          </div>
        )}
      </div>

      {/* REGION 3: RIGHT CONTEXTUAL INTELLIGENCE & ONCOLOGY CONNECTIONS */}
      <div className="w-72 bg-terminal-surface terminal-border-l flex flex-col h-full shrink-0 font-mono text-xs">
        <div className="p-2.5 bg-terminal-panel terminal-border-b flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wider">
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Ontology & Context</span>
          </div>
          <span className="text-[10px] text-slate-500">{relationships.length} Ties</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
          {/* Peer Competitors */}
          {activeCompany?.competitors && activeCompany.competitors.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Named Peer Competitors
              </div>
              <div className="space-y-1">
                {activeCompany.competitors.map((comp, idx) => (
                  <div key={idx} className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-300 flex items-center justify-between">
                    <span>{comp}</span>
                    <span className="text-[9px] text-slate-500">PEER</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Supply Chain Counterparties */}
          {activeCompany?.suppliers && activeCompany.suppliers.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Key Supply Chain Counterparties
              </div>
              <div className="space-y-1">
                {activeCompany.suppliers.map((supp, idx) => (
                  <div key={idx} className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-300 flex items-center justify-between">
                    <span>{supp}</span>
                    <span className="text-[9px] text-slate-500">SUPPLIER</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graph Relationships / Associations */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Knowledge Graph Relationships
            </div>

            {relationships.length === 0 ? (
              <div className="text-[11px] text-slate-500 p-2 text-center border border-dashed border-slate-800 rounded">
                No active sub-graph edges registered
              </div>
            ) : (
              <div className="space-y-1">
                {relationships.map((rel, idx) => (
                  <div key={idx} className="p-2 bg-terminal-panel terminal-border rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-semibold truncate max-w-[150px]">
                        {rel.label}
                      </span>
                      {rel.lift && (
                        <span className="text-slate-300 text-[10px] font-bold">
                          {rel.lift}x lift
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">
                      rel: {rel.relation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Source Regulatory Citation */}
          {activeCompany && (
            <div className="pt-2 border-t border-terminal-border/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Filing Provenance Source
              </div>
              <div className="text-[11px] text-slate-400 break-words leading-relaxed font-sans">
                {activeCompany.source_attribution}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
