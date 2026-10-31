"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Printer,
  ShieldAlert,
  CheckCircle2,
  Share2,
  FileText,
  AlertOctagon,
  Download
} from "lucide-react";
import { api } from "@/services/api";
import { DiligenceResponse, CompanySummary } from "@/types";

interface DueDiligenceViewProps {
  initialTargetId?: string;
}

export const DueDiligenceView: React.FC<DueDiligenceViewProps> = ({ initialTargetId }) => {
  const [target, setTarget] = useState<string>(initialTargetId || "Mutual Funds");
  const [report, setReport] = useState<DiligenceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);

  useEffect(() => {
    api.getCompanies().then(setCompanies).catch(console.error);
    generateReport(target);
  }, []);

  const generateReport = async (targetId: string) => {
    try {
      setLoading(true);
      const res = await api.analyzeDueDiligence(targetId);
      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full w-full bg-terminal-bg select-text overflow-y-auto">
      {/* Top Diligence Toolbar */}
      <div className="h-11 bg-terminal-surface terminal-border-b px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <FileCheck2 className="w-4 h-4 text-sky-400" />
            <span>Due Diligence Dossier</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Target Entity:</span>
            <select
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                generateReport(e.target.value);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 px-2.5 py-0.5 rounded text-xs focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.ticker} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generateReport(target)}
            disabled={loading}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-sky-400 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Re-Analyze"}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Content */}
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center p-20 space-y-3 font-mono">
            <span className="w-8 h-8 border-2 border-terminal-cyan border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-terminal-cyan font-bold tracking-wider">
              ASSEMBLING 8-PART DUE DILIGENCE DOSSIER...
            </div>
            <div className="text-[11px] text-terminal-muted">
              Correlating verified statistics with multi-hop graph lift associations
            </div>
          </div>
        )}

        {!loading && report && (
          <div className="space-y-6">
            {/* Dossier Header */}
            <div className="p-4 bg-terminal-surface terminal-border rounded flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono text-terminal-dim uppercase">
                  CONFIDENTIAL EXECUTIVE REPORT // AGY-TERM-DD
                </div>
                <h1 className="text-lg font-mono font-bold text-terminal-cyan mt-1">
                  DUE DILIGENCE EVALUATION: {report.target}
                </h1>
                <div className="text-[11px] font-mono text-terminal-muted mt-0.5">
                  Scope: Empirical Distribution Profiling, Graph Association Lift, & Risk Analysis
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-0.5 bg-terminal-panel terminal-border rounded text-terminal-green">
                  STATUS: VERIFIED GROUNDED
                </span>
              </div>
            </div>

            {/* Verified Facts & Limitations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verified Facts */}
              <div className="p-4 bg-terminal-surface terminal-border rounded font-mono space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-terminal-green uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>EMPIRICALLY VERIFIED BASELINE FACTS</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-terminal-muted">
                  {report.verified_facts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-terminal-green font-bold">✓</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strict Disclaimers & Model Boundaries */}
              <div className="p-4 bg-terminal-surface terminal-border rounded font-mono space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-terminal-amber uppercase">
                  <AlertOctagon className="w-4 h-4" />
                  <span>ANALYTICAL BOUNDARIES & LIMITATIONS</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-terminal-muted">
                  {report.disclaimers.map((disc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-terminal-amber font-bold">!</span>
                      <span>{disc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Executive Synthesis Report (8 Parts) */}
            <div className="p-5 bg-terminal-surface terminal-border rounded font-mono space-y-3">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <span className="text-xs font-bold text-terminal-cyan uppercase">
                  EXECUTIVE DOSSIER SYNTHESIS
                </span>
                <span className="text-[10px] text-terminal-dim">EVALUATION MODEL: GROQ LLM / GRAPHRAG</span>
              </div>
              <div className="text-xs text-terminal-text leading-relaxed whitespace-pre-wrap">
                {report.executive_summary}
              </div>
            </div>

            {/* Association Matrix */}
            <div className="p-4 bg-terminal-surface terminal-border rounded font-mono space-y-3">
              <div className="text-xs font-bold text-terminal-dim uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-terminal-cyan" />
                <span>SIGNIFICANT STATISTICAL ASSOCIATIONS (LIFT &ge; 1.5)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {report.graph_associations.slice(0, 9).map((assoc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-terminal-panel terminal-border rounded flex flex-col justify-between text-xs space-y-1"
                  >
                    <span className="text-terminal-text font-bold truncate">
                      {assoc.entity}
                    </span>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-terminal-dim">{assoc.co_occurrences} Cohort Pairs</span>
                      <span className="text-terminal-amber font-bold">{assoc.lift}x Lift</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exact Aggregate Profile */}
            <div className="p-4 bg-terminal-surface terminal-border rounded font-mono space-y-2">
              <div className="text-xs font-bold text-terminal-dim uppercase tracking-wider">
                EXACT AGGREGATE STATISTICAL DISTRIBUTION
              </div>
              <div className="p-3 bg-terminal-bg terminal-border rounded text-[11px] text-terminal-muted whitespace-pre-wrap leading-relaxed">
                {report.statistical_profile}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

