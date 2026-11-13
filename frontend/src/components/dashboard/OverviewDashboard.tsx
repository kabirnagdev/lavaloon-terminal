"use client";

import React, { useState, useEffect } from "react";
import { CompanySummary, HealthStatus } from "@/types";
import { getSeries, DataSeriesPoint, getCleanCompanies, CleanCompanySummary } from "@/services/dataLayer";
import { LineChart } from "@/components/charts/LineChart";

interface OverviewDashboardProps {
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  onNavigate: (module: string) => void;
  health: HealthStatus | null;
  onOpenIngestion?: () => void;
}

interface TableRowData {
  ticker: string;
  name: string;
  currency: string;
  period: string;
  revenue: number;
  grossProfit: number;
  operatingMargin: number;
  netIncome: number;
  fcf: number;
  sourceFile: string;
  sourceRow: number;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onNavigate,
  onOpenIngestion
}) => {
  const [aaplRevenueSeries, setAaplRevenueSeries] = useState<DataSeriesPoint[]>([]);
  const [nvdaRevenueSeries, setNvdaRevenueSeries] = useState<DataSeriesPoint[]>([]);
  const [msftMarginSeries, setMsftMarginSeries] = useState<DataSeriesPoint[]>([]);
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch real series for charts using getSeries
    Promise.all([
      getSeries("AAPL", "total_revenue"),
      getSeries("NVDA", "total_revenue"),
      getSeries("MSFT", "operating_margin_pct"),
      getCleanCompanies()
    ]).then(async ([aaplRev, nvdaRev, msftMargin, cleanComps]) => {
      setAaplRevenueSeries(aaplRev);
      setNvdaRevenueSeries(nvdaRev);
      setMsftMarginSeries(msftMargin);

      // Build verified rows strictly from getSeries for all 10 companies
      const rows: TableRowData[] = [];
      const corporateTickers = ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "GOOGL", "RELIANCE", "TCS", "INFY", "HDFCBANK"];

      for (const ticker of corporateTickers) {
        const revSeries = await getSeries(ticker, "total_revenue");
        const gpSeries = await getSeries(ticker, "gross_profit");
        const omSeries = await getSeries(ticker, "operating_margin_pct");
        const niSeries = await getSeries(ticker, "net_income");
        const fcfSeries = await getSeries(ticker, "free_cash_flow");

        if (revSeries.length > 0) {
          const latestRev = revSeries[revSeries.length - 1];
          const latestGp = gpSeries[gpSeries.length - 1]?.value || 0;
          const latestOm = omSeries[omSeries.length - 1]?.value || 0;
          const latestNi = niSeries[niSeries.length - 1]?.value || 0;
          const latestFcf = fcfSeries[fcfSeries.length - 1]?.value || 0;

          rows.push({
            ticker,
            name: latestRev.company,
            currency: latestRev.currency,
            period: latestRev.period,
            revenue: latestRev.value,
            grossProfit: latestGp,
            operatingMargin: latestOm,
            netIncome: latestNi,
            fcf: latestFcf,
            sourceFile: latestRev.source_file,
            sourceRow: latestRev.source_row
          });
        }
      }
      setTableData(rows);
      setLoading(false);
    }).catch((err) => {
      console.error("Dashboard data load error:", err);
      setLoading(false);
    });
  }, []);

  const formatCurrency = (val: number, curr: string) => {
    if (curr === "USD") {
      if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
      return `$${val.toLocaleString()}`;
    }
    return `₹${val.toLocaleString()} Cr`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-terminal-bg overflow-y-auto p-3.5 space-y-3 font-sans select-text">
      {/* Page Title & Purpose Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-terminal-border gap-2">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-sectional performance and verified regulatory filings for monitored corporations.
          </p>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Data Date: <span className="text-slate-300">FY2022–FY2026 Filings</span> &bull; 10 Monitored Filers
        </div>
      </div>

      {/* Real Charts Grid (100% driven by getSeries) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <LineChart
          series={aaplRevenueSeries}
          title="Apple Inc. Revenue Trend"
          unit="USD"
          currency="USD"
          color="#38bdf8"
          height={180}
        />
        <LineChart
          series={nvdaRevenueSeries}
          title="NVIDIA Revenue Trajectory"
          unit="USD"
          currency="USD"
          color="#10b981"
          height={180}
        />
        <LineChart
          series={msftMarginSeries}
          title="Microsoft Operating Margin"
          unit="%"
          currency="USD"
          isPercentage={true}
          color="#818cf8"
          height={180}
        />
      </div>

      {/* Verified Audited Filings Table */}
      <div className="bg-terminal-surface terminal-border rounded flex flex-col">
        <div className="p-3 border-b border-terminal-border flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-slate-200">
              Audited Financial Filings Master Table
            </h2>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Single trusted data layer records parsed from SEC Form 10-K and BSE filings.
            </div>
          </div>
          <button
            onClick={() => onNavigate("financials")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-200 transition-colors"
          >
            Compare Statements &rarr;
          </button>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0e14] text-slate-400 border-b border-terminal-border text-[11px]">
              <tr>
                <th className="py-2 px-3 font-semibold">Company / Ticker</th>
                <th className="py-2 px-3 font-semibold">Period</th>
                <th className="py-2 px-3 font-semibold text-right">Revenue</th>
                <th className="py-2 px-3 font-semibold text-right">Gross Profit</th>
                <th className="py-2 px-3 font-semibold text-right">Op. Margin</th>
                <th className="py-2 px-3 font-semibold text-right">Net Income</th>
                <th className="py-2 px-3 font-semibold text-right">Free Cash Flow</th>
                <th className="py-2 px-3 font-semibold">Source Filing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Loading clean financial data...
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Not available in provided data
                  </td>
                </tr>
              ) : (
                tableData.map((row) => (
                  <tr
                    key={row.ticker}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => {
                      onSelectCompany(row.ticker.toLowerCase());
                      onNavigate("companies");
                    }}
                  >
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-100">{row.ticker}</div>
                      <div className="text-[10px] text-slate-400">{row.name}</div>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-300">
                      {row.period}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-slate-100 tabular-nums">
                      {formatCurrency(row.revenue, row.currency)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                      {formatCurrency(row.grossProfit, row.currency)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-400 tabular-nums font-semibold">
                      {row.operatingMargin.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-200 tabular-nums">
                      {formatCurrency(row.netIncome, row.currency)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                      {formatCurrency(row.fcf, row.currency)}
                    </td>
                    <td className="py-2 px-3 text-[10px] text-slate-500 max-w-[200px] truncate" title={`${row.sourceFile} (Row ${row.sourceRow})`}>
                      {row.sourceFile}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-2 border-t border-terminal-border/40 text-[10px] text-slate-500 flex items-center justify-between px-3">
          <span>* Click any row to inspect company balance sheet and business segments</span>
          <span>Currency: USD (Full Units / Billions) &bull; INR (Crores)</span>
        </div>
      </div>
    </div>
  );
};
