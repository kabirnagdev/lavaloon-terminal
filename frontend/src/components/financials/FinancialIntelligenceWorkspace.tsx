"use client";

import React, { useState, useEffect } from "react";
import { CleanCompanySummary, getCleanCompanies, getSeries, DataSeriesPoint } from "@/services/dataLayer";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { ArrowRight, RefreshCw, FileText } from "lucide-react";

interface FinancialIntelligenceWorkspaceProps {
  initialCompanyId?: string;
  onNavigateToDiligence?: (id: string) => void;
}

export const FinancialIntelligenceWorkspace: React.FC<FinancialIntelligenceWorkspaceProps> = ({
  initialCompanyId = "aapl",
  onNavigateToDiligence
}) => {
  const [companies, setCompanies] = useState<CleanCompanySummary[]>([]);
  const [compAId, setCompAId] = useState<string>("AAPL");
  const [compBId, setCompBId] = useState<string>("MSFT");

  const [seriesA, setSeriesA] = useState<Record<string, DataSeriesPoint[]>>({});
  const [seriesB, setSeriesB] = useState<Record<string, DataSeriesPoint[]>>({});
  const [currencyMode, setCurrencyMode] = useState<"native" | "usd" | "inr">("native");
  const [loading, setLoading] = useState(true);

  const FX_USD_TO_INR = 84.50;

  useEffect(() => {
    getCleanCompanies().then((comps) => {
      setCompanies(comps);
      if (comps.length > 0) {
        const foundA = comps.find((c) => c.id === initialCompanyId || c.ticker.toLowerCase() === initialCompanyId.toLowerCase());
        setCompAId(foundA ? foundA.ticker : comps[0].ticker);
        setCompBId(comps.length > 1 ? comps[1].ticker : comps[0].ticker);
      }
    }).catch(console.error);
  }, [initialCompanyId]);

  const loadData = async (tickerA: string, tickerB: string) => {
    setLoading(true);
    const metrics = [
      "total_revenue", "gross_profit", "operating_income", "net_income",
      "operating_margin_pct", "operating_cash_flow", "capital_expenditure",
      "free_cash_flow", "total_assets", "total_debt", "cash_and_equivalents"
    ];

    const mapA: Record<string, DataSeriesPoint[]> = {};
    const mapB: Record<string, DataSeriesPoint[]> = {};

    for (const m of metrics) {
      mapA[m] = await getSeries(tickerA, m);
      mapB[m] = await getSeries(tickerB, m);
    }

    setSeriesA(mapA);
    setSeriesB(mapB);
    setLoading(false);
  };

  useEffect(() => {
    if (compAId && compBId) {
      loadData(compAId, compBId);
    }
  }, [compAId, compBId]);

  const compA = companies.find((c) => c.ticker === compAId) || companies[0];
  const compB = companies.find((c) => c.ticker === compBId) || companies[1];

  const convertVal = (val: number | undefined, curr: string | undefined, isPct = false): number | undefined => {
    if (val === undefined || isPct) return val;
    if (currencyMode === "native") return val;
    if (currencyMode === "usd") {
      if (curr === "USD") return val;
      // INR Crores -> USD
      return (val * 1e7) / FX_USD_TO_INR;
    }
    if (currencyMode === "inr") {
      if (curr === "INR") return val;
      // USD -> INR Crores
      return (val * FX_USD_TO_INR) / 1e7;
    }
    return val;
  };

  const formatDisplay = (val: number | undefined, originalCurr: string | undefined, isPct = false): string => {
    if (val === undefined || val === null) return "N/A";
    if (isPct) return `${val.toFixed(2)}%`;

    const activeCurr = currencyMode === "native" ? originalCurr : currencyMode.toUpperCase();
    const cVal = convertVal(val, originalCurr, isPct);
    if (cVal === undefined) return "N/A";

    if (activeCurr === "USD") {
      if (Math.abs(cVal) >= 1e9) return `$${(cVal / 1e9).toFixed(2)}B`;
      return `$${cVal.toLocaleString()}`;
    }
    return `₹${cVal.toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`;
  };

  // Metric Rows definition
  const MATRIX_ROWS = [
    { key: "total_revenue", label: "Total Revenue", isPct: false },
    { key: "gross_profit", label: "Gross Profit", isPct: false },
    { key: "operating_income", label: "Operating Income", isPct: false },
    { key: "net_income", label: "Net Income", isPct: false },
    { key: "operating_margin_pct", label: "Operating Margin (%)", isPct: true },
    { key: "operating_cash_flow", label: "Operating Cash Flow", isPct: false },
    { key: "capital_expenditure", label: "Capital Expenditure", isPct: false },
    { key: "free_cash_flow", label: "Free Cash Flow", isPct: false },
    { key: "total_assets", label: "Total Assets", isPct: false },
    { key: "total_debt", label: "Total Debt", isPct: false },
    { key: "cash_and_equivalents", label: "Cash & Equivalents", isPct: false }
  ];

  const periodsA = seriesA["total_revenue"]?.map((p) => p.period) || [];
  const periodsB = seriesB["total_revenue"]?.map((p) => p.period) || [];
  const latestPeriodA = periodsA[periodsA.length - 1] || "FY2024";
  const latestPeriodB = periodsB[periodsB.length - 1] || "FY2024";

  // Pre-normalized series for grouped bar chart
  const barSeriesA = (seriesA["total_revenue"] || []).map((pt) => ({
    ...pt,
    value: convertVal(pt.value, compA?.currency) || pt.value,
    currency: currencyMode === "native" ? pt.currency : currencyMode.toUpperCase(),
    unit: currencyMode === "usd" ? "USD" : currencyMode === "inr" ? "INR Crores" : pt.unit
  }));

  const barSeriesB = (seriesB["total_revenue"] || []).map((pt) => ({
    ...pt,
    value: convertVal(pt.value, compB?.currency) || pt.value,
    currency: currencyMode === "native" ? pt.currency : currencyMode.toUpperCase(),
    unit: currencyMode === "usd" ? "USD" : currencyMode === "inr" ? "INR Crores" : pt.unit
  }));

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto p-4 space-y-4 font-sans select-text">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display tracking-tight metallic-text">Financials & Compare</h1>
            <span className="text-[10px] px-2 py-0.5 rounded metallic-pill text-indigo-300 font-mono">MULTI-STATEMENT</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Side-by-side statement comparison with currency isolation and stated FX conversion.
          </p>
        </div>

        {/* Currency Normalization Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-display text-[11px] uppercase tracking-wider">Currency:</span>
          <div className="flex metallic-card-subtle rounded-lg p-1 text-[11px]">
            <button
              onClick={() => setCurrencyMode("native")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-display font-medium ${
                currencyMode === "native" ? "metallic-pill-active text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Native
            </button>
            <button
              onClick={() => setCurrencyMode("usd")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-display font-medium ${
                currencyMode === "usd" ? "metallic-pill-active text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              USD Normal ($)
            </button>
            <button
              onClick={() => setCurrencyMode("inr")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-display font-medium ${
                currencyMode === "inr" ? "metallic-pill-active text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              INR Normal (₹ Cr)
            </button>
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="metallic-surface rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Company A Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-display text-sky-400">Company A:</span>
            <select
              value={compAId}
              onChange={(e) => setCompAId(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
            >
              {companies.map((c) => (
                <option key={c.ticker} value={c.ticker}>
                  {c.ticker} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 text-xs font-bold font-mono">VS</span>

          {/* Company B Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-display text-indigo-400">Company B:</span>
            <select
              value={compBId}
              onChange={(e) => setCompBId(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
            >
              {companies.map((c) => (
                <option key={c.ticker} value={c.ticker}>
                  {c.ticker} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {onNavigateToDiligence && compA && (
          <button
            onClick={() => onNavigateToDiligence(compA.id)}
            className="px-3 py-1.5 metallic-pill hover:border-white/20 rounded-lg text-xs font-display font-medium text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Generate Report for {compA.ticker}</span>
          </button>
        )}
      </div>

      {/* Grouped Bar Comparison Chart */}
      <GroupedBarChart
        companyA={compA?.name || compAId}
        companyB={compB?.name || compBId}
        seriesA={barSeriesA}
        seriesB={barSeriesB}
        title="Revenue Comparison Across Reporting Periods"
        unit={currencyMode === "usd" ? "USD" : currencyMode === "inr" ? "INR Crores" : compA?.unit || "USD"}
        currency={currencyMode === "native" ? `${compA?.currency || "USD"} / ${compB?.currency || "USD"}` : currencyMode.toUpperCase()}
        fxRateUsed={currencyMode !== "native" ? `1 USD = ${FX_USD_TO_INR.toFixed(2)} INR` : undefined}
      />

      {/* Comparative Multi-Statement Table */}
      <div className="metallic-surface rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-xs font-bold font-display text-slate-100 tracking-tight">
            Statement Metrics Comparison ({latestPeriodA} vs {latestPeriodB})
          </h3>
          <span className="text-[10px] text-slate-400 font-mono metallic-card-subtle px-2 py-0.5 rounded">
            {currencyMode === "native" ? "Native Reported Currencies" : `Converted at 1 USD = ₹${FX_USD_TO_INR.toFixed(2)}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 text-slate-400 border-b border-white/[0.06] text-[10px] font-display uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Financial Metric</th>
                <th className="py-2.5 px-3 font-semibold text-right text-sky-400">
                  {compA?.ticker} ({latestPeriodA})
                </th>
                <th className="py-2.5 px-3 font-semibold text-right text-indigo-400">
                  {compB?.ticker} ({latestPeriodB})
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">Variance / Delta</th>
                <th className="py-2.5 px-3 font-semibold">Source Filings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {MATRIX_ROWS.map(({ key, label, isPct }) => {
                const ptA = seriesA[key]?.length ? seriesA[key][seriesA[key].length - 1] : undefined;
                const ptB = seriesB[key]?.length ? seriesB[key][seriesB[key].length - 1] : undefined;

                const valA = ptA?.value;
                const valB = ptB?.value;

                const normA = convertVal(valA, compA?.currency, isPct);
                const normB = convertVal(valB, compB?.currency, isPct);

                let diffStr = "—";
                if (normA !== undefined && normB !== undefined) {
                  const diff = normA - normB;
                  if (isPct) {
                    diffStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}% pts`;
                  } else {
                    const curr = currencyMode === "native" ? compA?.currency : currencyMode.toUpperCase();
                    diffStr = formatDisplay(diff, curr, isPct);
                  }
                }

                return (
                  <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-300">
                      {label}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-100 tabular-nums">
                      {formatDisplay(valA, compA?.currency, isPct)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-100 tabular-nums">
                      {formatDisplay(valB, compB?.currency, isPct)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-400 tabular-nums">
                      {diffStr}
                    </td>
                    <td className="py-2 px-3 text-[10px] text-slate-500 max-w-[200px] truncate">
                      {ptA?.source_file || ptB?.source_file || "Audited Form 10-K / BSE"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
