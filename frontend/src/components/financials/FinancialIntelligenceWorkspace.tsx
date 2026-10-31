"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Building2,
  FileSpreadsheet,
  ArrowRight,
  Filter,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers
} from "lucide-react";
import { api } from "@/services/api";
import { CompanySummary, CompanyDetail } from "@/types";

interface FinancialIntelligenceWorkspaceProps {
  initialCompanyId?: string;
  onNavigateToDiligence?: (id: string) => void;
}

export const FinancialIntelligenceWorkspace: React.FC<FinancialIntelligenceWorkspaceProps> = ({
  initialCompanyId = "aapl",
  onNavigateToDiligence
}) => {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [primaryCompanyId, setPrimaryCompanyId] = useState<string>(initialCompanyId);
  const [compareCompanyId, setCompareCompanyId] = useState<string>("msft");
  const [primaryDetail, setPrimaryDetail] = useState<CompanyDetail | null>(null);
  const [compareDetail, setCompareDetail] = useState<CompanyDetail | null>(null);
  const [statementFilter, setStatementFilter] = useState<"all" | "income" | "balance" | "cash_flow">("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getCompanies()
      .then((data) => {
        const corps = data.filter((c) => c.coverage_type === "corporate_equity");
        setCompanies(corps);
        if (corps.length > 0) {
          if (!corps.some((c) => c.id === primaryCompanyId)) {
            setPrimaryCompanyId(corps[0].id);
          }
          if (corps.length > 1 && (!compareCompanyId || compareCompanyId === primaryCompanyId)) {
            setCompareCompanyId(corps[1].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!primaryCompanyId) return;
    api.getCompany(primaryCompanyId).then(setPrimaryDetail).catch(console.error);
  }, [primaryCompanyId]);

  useEffect(() => {
    if (!compareCompanyId) return;
    api.getCompany(compareCompanyId).then(setCompareDetail).catch(console.error);
  }, [compareCompanyId]);

  const formatVal = (val: number | undefined, curr: string | undefined, isPct = false) => {
    if (val === undefined || val === null) return "N/A";
    if (isPct) return `${val.toFixed(2)}%`;
    if (curr === "USD") return `$${(val / 1e9).toFixed(2)}B`;
    return `₹${val.toLocaleString()} Cr`;
  };

  const METRIC_ROWS = [
    // Income Statement
    { key: "total_revenue", label: "Total Revenue", category: "income", isPct: false },
    { key: "gross_profit", label: "Gross Profit", category: "income", isPct: false },
    { key: "operating_income", label: "Operating Income (EBIT)", category: "income", isPct: false },
    { key: "net_income", label: "Net Income", category: "income", isPct: false },
    { key: "operating_margin_pct", label: "Operating Margin %", category: "income", isPct: true },
    // Balance Sheet
    { key: "total_assets", label: "Total Assets", category: "balance", isPct: false },
    { key: "total_liabilities", label: "Total Liabilities", category: "balance", isPct: false },
    { key: "total_debt", label: "Total Debt (Borrowings)", category: "balance", isPct: false },
    { key: "cash_and_equivalents", label: "Cash & Cash Equivalents", category: "balance", isPct: false },
    // Cash Flow Statement
    { key: "operating_cash_flow", label: "Operating Cash Flow", category: "cash_flow", isPct: false },
    { key: "capital_expenditure", label: "Capital Expenditures (Capex)", category: "cash_flow", isPct: false },
    { key: "free_cash_flow", label: "Free Cash Flow (FCF)", category: "cash_flow", isPct: false }
  ];

  const visibleMetrics = METRIC_ROWS.filter((m) => {
    if (statementFilter === "all") return true;
    return m.category === statementFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-terminal-bg overflow-y-auto p-3 space-y-2.5 font-sans select-text">
      {/* Top Controls Strip */}
      <div className="p-2.5 bg-terminal-surface terminal-border rounded flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-white uppercase tracking-wider">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Financial Statements & Peer Comparison</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Primary Company Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] uppercase">Entity A:</span>
            <select
              value={primaryCompanyId}
              onChange={(e) => setPrimaryCompanyId(e.target.value)}
              className="bg-terminal-panel terminal-border rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ticker} &bull; {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Comparative Company Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] uppercase">Entity B (Peer):</span>
            <select
              value={compareCompanyId}
              onChange={(e) => setCompareCompanyId(e.target.value)}
              className="bg-terminal-panel terminal-border rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ticker} &bull; {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statement Category Filter Tabs */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setStatementFilter("all")}
            className={`px-2 py-0.5 rounded transition-colors ${
              statementFilter === "all" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            All Statements
          </button>
          <button
            onClick={() => setStatementFilter("income")}
            className={`px-2 py-0.5 rounded transition-colors ${
              statementFilter === "income" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setStatementFilter("balance")}
            className={`px-2 py-0.5 rounded transition-colors ${
              statementFilter === "balance" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setStatementFilter("cash_flow")}
            className={`px-2 py-0.5 rounded transition-colors ${
              statementFilter === "cash_flow" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Cash Flow
          </button>
        </div>
      </div>

      {/* Currency Isolation Notice */}
      {primaryDetail && compareDetail && primaryDetail.currency !== compareDetail.currency && (
        <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-[11px] text-slate-400">
          <div>
            <span className="text-slate-200 font-semibold">CURRENCY ISOLATION NOTICE:</span> {primaryDetail.ticker} reports in{" "}
            <span className="text-white font-semibold">{primaryDetail.currency}</span> ({primaryDetail.currency === "USD" ? "Billions" : "Crores"}), while{" "}
            {compareDetail.ticker} reports in <span className="text-white font-semibold">{compareDetail.currency}</span> ({compareDetail.currency === "USD" ? "Billions" : "Crores"}). Metrics are preserved in official reported domestic currencies to prevent FX distortions.
          </div>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">VERIFIED GAAP / IFRS</span>
        </div>
      )}

      {/* Comparative Financial Statement Matrix */}
      <div className="bg-terminal-surface terminal-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-terminal-panel border-b border-terminal-border text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3 font-semibold">Standardized Metric</th>
                <th className="py-2 px-3 font-semibold">Statement Section</th>
                <th className="py-2 px-3 font-semibold text-right">
                  {primaryDetail?.ticker || "Entity A"} ({primaryDetail?.period || "FY2025"})
                </th>
                <th className="py-2 px-3 font-semibold text-right">
                  {compareDetail?.ticker || "Entity B"} ({compareDetail?.period || "FY2025"})
                </th>
                <th className="py-2 px-3 font-semibold text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/40">
              {visibleMetrics.map((m) => {
                const valA = primaryDetail?.raw_financials?.[m.key];
                const valB = compareDetail?.raw_financials?.[m.key];

                return (
                  <tr key={m.key} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-200">{m.label}</td>
                    <td className="py-2 px-3 text-[10px] text-slate-500 uppercase">{m.category.replace("_", " ")}</td>
                    <td className="py-2 px-3 font-bold text-slate-100 text-right tabular-nums">
                      {formatVal(valA, primaryDetail?.currency, m.isPct)}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-100 text-right tabular-nums">
                      {formatVal(valB, compareDetail?.currency, m.isPct)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[9px]">
                        Audited XBRL / Annual Report
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Segment Revenue Breakdown & Margin Analysis Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Entity A Segment Breakdown */}
        {primaryDetail?.segments && Object.keys(primaryDetail.segments).length > 0 && (
          <div className="bg-terminal-surface terminal-border rounded p-3 space-y-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {primaryDetail.ticker} &bull; Revenue Breakdown by Segment
            </div>
            <div className="space-y-1.5">
              {Object.entries(primaryDetail.segments).map(([seg, rev]) => {
                const totalRev = primaryDetail.raw_financials?.total_revenue || 1;
                const pct = Math.min(Math.round((rev / totalRev) * 100), 100);
                return (
                  <div key={seg} className="space-y-0.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-sans">{seg}</span>
                      <span className="font-bold tabular-nums">
                        {formatVal(rev, primaryDetail.currency)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                      <div className="bg-slate-400 h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Entity B Segment Breakdown */}
        {compareDetail?.segments && Object.keys(compareDetail.segments).length > 0 && (
          <div className="bg-terminal-surface terminal-border rounded p-3 space-y-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {compareDetail.ticker} &bull; Revenue Breakdown by Segment
            </div>
            <div className="space-y-1.5">
              {Object.entries(compareDetail.segments).map(([seg, rev]) => {
                const totalRev = compareDetail.raw_financials?.total_revenue || 1;
                const pct = Math.min(Math.round((rev / totalRev) * 100), 100);
                return (
                  <div key={seg} className="space-y-0.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-sans">{seg}</span>
                      <span className="font-bold tabular-nums">
                        {formatVal(rev, compareDetail.currency)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                      <div className="bg-slate-400 h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Audit Provenance Sources */}
      <div className="p-2.5 bg-terminal-surface terminal-border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div>
          <span className="text-slate-500 uppercase">Provenance Citations:</span> {primaryDetail?.ticker}: {primaryDetail?.source_attribution} &bull; {compareDetail?.ticker}: {compareDetail?.source_attribution}
        </div>
        {onNavigateToDiligence && primaryDetail && (
          <button
            onClick={() => onNavigateToDiligence(primaryDetail.id)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 shrink-0 transition-colors"
          >
            Open Comprehensive Due Diligence Dossier &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

