"use client";

import React, { useState } from "react";
import { DataSeriesPoint } from "@/services/dataLayer";

interface LineChartProps {
  series: DataSeriesPoint[];
  title: string;
  unit: string;
  currency: string;
  source?: string;
  color?: string;
  isPercentage?: boolean;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  series,
  title,
  unit,
  currency,
  source,
  color = "#38bdf8",
  isPercentage = false,
  height = 200
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!series || series.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center p-6 metallic-surface rounded-xl border border-white/[0.08] text-slate-500 text-xs"
        style={{ minHeight: height }}
      >
        <span className="font-medium">{title}</span>
        <span className="mt-1 text-[11px] text-slate-600">Not available in provided data</span>
      </div>
    );
  }

  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 35;
  const svgWidth = 500;
  const svgHeight = height;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const values = series.map((s) => s.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const getX = (index: number) => {
    if (series.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (series.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
  };

  const points = series.map((s, i) => `${getX(i)},${getY(s.value)}`).join(" ");

  const formatTick = (val: number) => {
    if (isPercentage) return `${val.toFixed(1)}%`;
    if (currency === "USD") {
      if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
      if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
      return `$${val.toLocaleString()}`;
    }
    // INR Crores
    if (Math.abs(val) >= 1e5) return `₹${(val / 1e5).toFixed(1)}L Cr`;
    return `₹${val.toLocaleString()} Cr`;
  };

  const formatTooltipVal = (val: number) => {
    if (isPercentage) return `${val.toFixed(2)}%`;
    if (currency === "USD") {
      if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B ($${val.toLocaleString()})`;
      return `$${val.toLocaleString()}`;
    }
    return `₹${val.toLocaleString()} Cr`;
  };

  const yTicks = [
    maxVal,
    minVal + range * 0.5,
    minVal
  ];

  const sourceCitation = source || (series[0] ? `${series[0].source_file} (Row ${series[0].source_row})` : "");

  const gradId = `line-grad-${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;

  return (
    <div className="w-full metallic-surface metallic-surface-hover rounded-xl p-3.5 flex flex-col justify-between select-none">
      {/* Header with Title and Unit */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color }} />
          <h4 className="text-xs font-bold font-display text-slate-100 tracking-tight">
            {title}
          </h4>
        </div>
        <div className="text-[10px] text-slate-400 font-mono metallic-card-subtle px-2 py-0.5 rounded">
          <span className="text-slate-200 font-semibold">{unit}</span> ({currency})
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((tickVal, idx) => {
            const y = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {formatTick(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Area fill with subtle metallic gradient */}
          {series.length > 1 && (
            <polygon
              points={`${getX(0)},${paddingTop + chartHeight} ${points} ${getX(series.length - 1)},${paddingTop + chartHeight}`}
              fill={`url(#${gradId})`}
            />
          )}

          {/* Line path */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />

          {/* Data Points */}
          {series.map((s, idx) => {
            const cx = getX(idx);
            const cy = getY(s.value);
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? "#ffffff" : "#0d111a"}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                {/* X-Axis Fiscal Period Label */}
                <text
                  x={cx}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  fill={isHovered ? "#f1f5f9" : "#94a3b8"}
                  fontSize="10"
                  fontWeight={isHovered ? "600" : "400"}
                  fontFamily="sans-serif"
                >
                  {s.period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && series[hoveredIdx] && (
          <div
            className="absolute z-20 pointer-events-none p-2.5 metallic-surface rounded-lg shadow-2xl text-[11px] font-sans border border-white/20"
            style={{
              left: Math.min(Math.max(10, (getX(hoveredIdx) / svgWidth) * 100 - 15), 70) + "%",
              top: "10%"
            }}
          >
            <div className="font-bold font-display text-slate-100">
              {series[hoveredIdx].period} &bull; {series[hoveredIdx].company}
            </div>
            <div className="text-sky-300 font-bold font-mono mt-0.5 text-xs">
              {formatTooltipVal(series[hoveredIdx].value)}
            </div>
            <div className="text-[9px] text-slate-400 mt-1 font-mono">
              Source: {series[hoveredIdx].source_file} (Row {series[hoveredIdx].source_row})
            </div>
          </div>
        )}
      </div>

      {/* Footer Source Attribution */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 mt-2 text-[10px] text-slate-500 font-mono">
        <span className="truncate">Source: {sourceCitation}</span>
        <span className="shrink-0 text-slate-500 font-sans">Audited Filings</span>
      </div>
    </div>
  );
};

