"use client";

import React, { useState } from "react";
import { DataSeriesPoint } from "@/services/dataLayer";

interface GroupedBarChartProps {
  companyA: string;
  companyB: string;
  seriesA: DataSeriesPoint[];
  seriesB: DataSeriesPoint[];
  title: string;
  unit: string;
  currency: string;
  source?: string;
  fxRateUsed?: string;
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  companyA,
  companyB,
  seriesA,
  seriesB,
  title,
  unit,
  currency,
  source,
  fxRateUsed
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if ((!seriesA || seriesA.length === 0) && (!seriesB || seriesB.length === 0)) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 bg-terminal-surface terminal-border rounded text-slate-500 text-xs">
        <span className="font-medium">{title}</span>
        <span className="mt-1 text-[11px] text-slate-600">Not available in provided data</span>
      </div>
    );
  }

  // Get common periods
  const periods = Array.from(
    new Set([...seriesA.map((s) => s.period), ...seriesB.map((s) => s.period)])
  ).sort();

  const mapA = new Map(seriesA.map((s) => [s.period, s.value]));
  const mapB = new Map(seriesB.map((s) => [s.period, s.value]));

  const allValues = [...seriesA.map((s) => s.value), ...seriesB.map((s) => s.value)];
  const maxVal = Math.max(...allValues, 1);

  const formatVal = (val: number | undefined) => {
    if (val === undefined || val === null) return "N/A";
    if (currency === "USD") {
      if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
      return `$${val.toLocaleString()}`;
    }
    return `₹${val.toLocaleString()} Cr`;
  };

  const svgWidth = 520;
  const svgHeight = 220;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const groupWidth = periods.length > 0 ? chartWidth / periods.length : chartWidth;
  const barWidth = Math.min(28, (groupWidth - 16) / 2);

  return (
    <div className="w-full bg-terminal-surface terminal-border rounded p-3 flex flex-col justify-between font-sans select-none">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-terminal-border/60 pb-2 mb-2 gap-2">
        <div>
          <h4 className="text-xs font-semibold text-slate-100 tracking-tight">
            {title}
          </h4>
          {fxRateUsed && (
            <div className="text-[10px] text-amber-400 font-mono mt-0.5">
              FX Conversion: {fxRateUsed}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
            <span className="text-slate-200 font-medium">{companyA}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span className="text-slate-200 font-medium">{companyB}</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Horizontal Grid */}
          {[maxVal, maxVal * 0.5, 0].map((tVal, i) => {
            const y = paddingTop + chartHeight - (tVal / maxVal) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {formatVal(tVal)}
                </text>
              </g>
            );
          })}

          {/* Groups per Period */}
          {periods.map((period, pIdx) => {
            const groupX = paddingLeft + pIdx * groupWidth;
            const valA = mapA.get(period) || 0;
            const valB = mapB.get(period) || 0;

            const heightA = (valA / maxVal) * chartHeight;
            const heightB = (valB / maxVal) * chartHeight;

            const xA = groupX + groupWidth / 2 - barWidth - 2;
            const xB = groupX + groupWidth / 2 + 2;

            const yA = paddingTop + chartHeight - heightA;
            const yB = paddingTop + chartHeight - heightB;

            const isHoverA = hoveredKey === `${period}-A`;
            const isHoverB = hoveredKey === `${period}-B`;

            return (
              <g key={period}>
                {/* Bar A */}
                <rect
                  x={xA}
                  y={yA}
                  width={barWidth}
                  height={Math.max(2, heightA)}
                  fill={isHoverA ? "#7dd3fc" : "#0284c7"}
                  rx="1"
                  className="cursor-pointer transition-colors"
                  onMouseEnter={() => setHoveredKey(`${period}-A`)}
                  onMouseLeave={() => setHoveredKey(null)}
                />

                {/* Bar B */}
                <rect
                  x={xB}
                  y={yB}
                  width={barWidth}
                  height={Math.max(2, heightB)}
                  fill={isHoverB ? "#a5b4fc" : "#6366f1"}
                  rx="1"
                  className="cursor-pointer transition-colors"
                  onMouseEnter={() => setHoveredKey(`${period}-B`)}
                  onMouseLeave={() => setHoveredKey(null)}
                />

                {/* Period X Label */}
                <text
                  x={groupX + groupWidth / 2}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover info badge */}
        {hoveredKey && (
          <div className="absolute top-2 right-4 bg-[#0c1017] border border-slate-700 px-2 py-1 rounded text-[11px] font-mono text-slate-200">
            {hoveredKey.endsWith("-A")
              ? `${companyA} (${hoveredKey.split("-")[0]}): ${formatVal(mapA.get(hoveredKey.split("-")[0]))}`
              : `${companyB} (${hoveredKey.split("-")[0]}): ${formatVal(mapB.get(hoveredKey.split("-")[0]))}`}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-terminal-border/60 pt-1.5 mt-2 text-[10px] text-slate-500">
        <span className="truncate">Source: {source || "Audited Form 10-K & BSE Filings"}</span>
        <span className="text-slate-600 font-mono">{unit} ({currency})</span>
      </div>
    </div>
  );
};

