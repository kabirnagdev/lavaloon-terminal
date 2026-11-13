"use client";

import React, { useState } from "react";

export interface SegmentBarItem {
  segment: string;
  value: number;
  unit: string;
  currency: string;
  period: string;
  source_file?: string;
  source_row?: number;
}

interface HorizontalBarChartProps {
  items: SegmentBarItem[];
  title: string;
  unit: string;
  currency: string;
  source?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  title,
  unit,
  currency,
  source
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 metallic-surface rounded-xl border border-white/[0.08] text-slate-500 text-xs">
        <span className="font-medium">{title}</span>
        <span className="mt-1 text-[11px] text-slate-600">Not available in provided data</span>
      </div>
    );
  }

  // Sort descending by value
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((acc, curr) => acc + curr.value, 0);
  const maxVal = sorted[0].value || 1;

  const formatVal = (val: number) => {
    if (currency === "USD") {
      if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
      return `$${val.toLocaleString()}`;
    }
    return `₹${val.toLocaleString()} Cr`;
  };

  const sourceCitation = source || (sorted[0]?.source_file ? `${sorted[0].source_file} (Row ${sorted[0].source_row})` : "");

  return (
    <div className="w-full metallic-surface metallic-surface-hover rounded-xl p-3.5 flex flex-col justify-between font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
        <h4 className="text-xs font-bold font-display text-slate-100 tracking-tight">
          {title}
        </h4>
        <div className="text-[10px] text-slate-400 font-mono metallic-card-subtle px-2 py-0.5 rounded">
          Total: <span className="text-slate-100 font-bold">{formatVal(total)}</span>
        </div>
      </div>

      {/* Bars List */}
      <div className="space-y-2 my-1">
        {sorted.map((item, idx) => {
          const pctOfTotal = total > 0 ? (item.value / total) * 100 : 0;
          const barWidthPct = (item.value / maxVal) * 100;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className={`p-1.5 rounded-lg transition-all ${
                isHovered ? "bg-white/[0.06] shadow-sm" : ""
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-200 font-medium truncate max-w-[240px]">
                  {item.segment}
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-100 font-bold">{formatVal(item.value)}</span>
                  <span className="text-slate-400 text-[10px]">({pctOfTotal.toFixed(1)}%)</span>
                </div>
              </div>

              {/* Progress bar with metallic gradient */}
              <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${barWidthPct}%`,
                    background: isHovered
                      ? "linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)"
                      : "linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)",
                    boxShadow: isHovered ? "0 0 10px rgba(56, 189, 248, 0.5)" : "none"
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 mt-2 text-[10px] text-slate-500 font-mono">
        <span className="truncate">Source: {sourceCitation}</span>
        <span className="text-slate-500 shrink-0 font-sans">Segment Disclosure</span>
      </div>
    </div>
  );
};

