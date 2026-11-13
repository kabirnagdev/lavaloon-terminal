"use client";

import React, { useState, useEffect } from "react";
import { CompanySummary, CompanyDetail } from "@/types";
import { getSeries, DataSeriesPoint, getCleanCompanies, getCleanSegments, CleanCompanySummary, CleanSegmentRecord } from "@/services/dataLayer";
import { LineChart } from "@/components/charts/LineChart";
import { HorizontalBarChart, SegmentBarItem } from "@/components/charts/HorizontalBarChart";
import { Search, Building2, FileText } from "lucide-react";

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
  const [cleanCompanies, setCleanCompanies] = useState<CleanCompanySummary[]>([]);
  const [activeCompany, setActiveCompany] = useState<CleanCompanySummary | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<DataSeriesPoint[]>([]);
  const [marginSeries, setMarginSeries] = useState<DataSeriesPoint[]>([]);
  const [segments, setSegments] = useState<CleanSegmentRecord[]>([]);
  const [allMetrics, setAllMetrics] = useState<Record<string, DataSeriesPoint>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Load companies list
  useEffect(() => {
    getCleanCompanies().then((comps) => {
      setCleanCompanies(comps);
      if (comps.length > 0) {
        const found = comps.find((c) => c.id === selectedCompanyId || c.ticker.toLowerCase() === selectedCompanyId.toLowerCase());
        setActiveCompany(found || comps[0]);
      }
      setLoading(false);
    }).catch(console.error);
  }, []);

  // Update when selectedCompanyId changes
  useEffect(() => {
    if (cleanCompanies.length === 0) return;
    const found = cleanCompanies.find(
      (c) => c.id === selectedCompanyId || c.ticker.toLowerCase() === selectedCompanyId.toLowerCase()
    );
    if (found) {
      setActiveCompany(found);
    }
  }, [selectedCompanyId, cleanCompanies]);

  // Load company details, series and segments strictly via data layer
  useEffect(() => {
    if (!activeCompany) return;
    const ticker = activeCompany.ticker;

    Promise.all([
      getSeries(ticker, "total_revenue"),
      getSeries(ticker, "operating_margin_pct"),
      getCleanSegments(ticker)
    ]).then(async ([revs, margins, segs]) => {
      setRevenueSeries(revs);
      setMarginSeries(margins);
      setSegments(segs);

      // Load all key metrics for latest period
      const metricKeys = [
        "total_revenue", "gross_profit", "operating_income", "net_income",
        "operating_margin_pct", "operating_cash_flow", "capital_expenditure",
        "free_cash_flow", "total_assets", "total_debt", "cash_and_equivalents"
      ];

      const metricsMap: Record<string, DataSeriesPoint> = {};
      for (const k of metricKeys) {
        const pts = await getSeries(ticker, k);
        if (pts.length > 0) {
          metricsMap[k] = pts[pts.length - 1];
        }
      }
      setAllMetrics(metricsMap);
    }).catch(console.error);
  }, [activeCompany]);

  const filtered = cleanCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val: number | undefined, curr: string | undefined, isPct = false) => {
    if (val === undefined || val === null) return "N/A";
    if (isPct) return `${val.toFixed(2)}%`;
    if (curr === "USD") {
      if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
      return `$${val.toLocaleString()}`;
    }
    return `₹${val.toLocaleString()} Cr`;
  };

  const segmentBarItems: SegmentBarItem[] = segments.map((s) => ({
    segment: s.segment,
    value: s.value,
    unit: s.unit,
    currency: s.currency,
    period: s.period,
    source_file: s.source_file,
    source_row: s.source_row
  }));

  return (
    <div className="flex h-full w-full bg-terminal-bg select-text font-sans overflow-hidden">
      {/* LEFT: COMPANY DIRECTORY */}
      <div className="w-64 bg-terminal-surface terminal-border-r flex flex-col h-full shrink-0">
        <div className="p-2.5 bg-terminal-panel terminal-border-b space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Monitored Companies</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {filtered.length} / {cleanCompanies.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Filter ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-terminal-bg terminal-border rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>
        </div>

        {/* Company Roster */}
        <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/40">
          {filtered.map((c) => {
            const isSelected = activeCompany?.ticker === c.ticker;
            return (
              <button
                key={c.ticker}
                onClick={() => {
                  setActiveCompany(c);
                  onSelectCompany(c.id);
                }}
                className={`w-full text-left p-2.5 transition-colors ${
                  isSelected ? "bg-slate-800 text-white border-l-2 border-sky-400" : "hover:bg-slate-800/40 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold font-mono">{c.ticker}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {c.country}
                  </span>
                </div>
                <div className="text-xs text-slate-300 truncate mt-0.5">
                  {c.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {c.sector} &bull; {c.currency}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER: COMPANY DOSSIER */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-3.5 space-y-3">
        {activeCompany ? (
          <>
            {/* Header Profile Bar */}
            <div className="bg-terminal-surface terminal-border rounded p-3 flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                    {activeCompany.ticker}
                  </span>
                  <h1 className="text-base font-bold text-white tracking-tight">
                    {activeCompany.name}
                  </h1>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
                    {activeCompany.periods[activeCompany.periods.length - 1]}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mt-1">
                  Sector: <span className="text-slate-200">{activeCompany.sector}</span> &bull; Industry: <span className="text-slate-200">{activeCompany.industry}</span> &bull; Solvency Risk: <span className="text-slate-200">{activeCompany.risk_level}</span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
                  {activeCompany.description}
                </p>
              </div>

              {onNavigateToDiligence && (
                <button
                  onClick={() => onNavigateToDiligence(activeCompany.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export Report &rarr;</span>
                </button>
              )}
            </div>

            {/* Charts Row: Time Trend + Segments Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <LineChart
                series={revenueSeries}
                title={`${activeCompany.name} Revenue Trajectory`}
                unit={activeCompany.unit}
                currency={activeCompany.currency}
                color="#38bdf8"
                height={190}
              />
              <HorizontalBarChart
                items={segmentBarItems}
                title="Business Segment Revenue Split"
                unit={activeCompany.unit}
                currency={activeCompany.currency}
              />
            </div>

            {/* Audited Highlights Table */}
            <div className="bg-terminal-surface terminal-border rounded p-3">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2 mb-2">
                <h3 className="text-xs font-semibold text-slate-200">
                  Audited Financial Highlights ({activeCompany.periods[activeCompany.periods.length - 1]})
                </h3>
                <span className="text-[10px] text-slate-500">
                  Source: {activeCompany.source_doc}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { key: "total_revenue", label: "Total Revenue", isPct: false },
                  { key: "gross_profit", label: "Gross Profit", isPct: false },
                  { key: "operating_income", label: "Operating Income", isPct: false },
                  { key: "net_income", label: "Net Income", isPct: false },
                  { key: "operating_margin_pct", label: "Operating Margin", isPct: true },
                  { key: "operating_cash_flow", label: "Operating Cash Flow", isPct: false },
                  { key: "capital_expenditure", label: "Capital Expenditure", isPct: false },
                  { key: "free_cash_flow", label: "Free Cash Flow", isPct: false },
                  { key: "total_assets", label: "Total Assets", isPct: false },
                  { key: "total_debt", label: "Total Debt", isPct: false },
                  { key: "cash_and_equivalents", label: "Cash & Equivalents", isPct: false }
                ].map(({ key, label, isPct }) => {
                  const pt = allMetrics[key];
                  return (
                    <div key={key} className="p-2 bg-[#0c1017] border border-terminal-border/60 rounded flex flex-col justify-between">
                      <span className="text-[10px] text-slate-500 uppercase">{label}</span>
                      <span className="text-sm font-bold font-mono text-slate-100 tabular-nums mt-1">
                        {pt ? formatCurrency(pt.value, activeCompany.currency, isPct) : "N/A"}
                      </span>
                      <span className="text-[9px] text-slate-600 mt-0.5 truncate">
                        {pt ? `Row ${pt.source_row}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Factors Disclosures */}
            {activeCompany.risks && activeCompany.risks.length > 0 && (
              <div className="bg-terminal-surface terminal-border rounded p-3 space-y-1.5">
                <h3 className="text-xs font-semibold text-slate-200">
                  Regulatory Risk Disclosures (Item 1A / Board Report)
                </h3>
                <ul className="space-y-1 text-xs text-slate-300">
                  {activeCompany.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs">
            Select a company from the left directory
          </div>
        )}
      </div>
    </div>
  );
};
