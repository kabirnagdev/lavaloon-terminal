"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Database, FileText, Copy, Check, Clock } from "lucide-react";
import { api } from "@/services/api";
import { ResearchQueryResponse } from "@/types";

interface ResearchWorkspaceProps {
  initialCompanyId?: string;
}

const DEFAULT_SUGGESTED_QUESTIONS = [
  "What was Apple's total revenue and net income in FY2025?",
  "Compare Microsoft and Apple operating margins over recent fiscal periods.",
  "What are NVIDIA's revenue growth figures between FY2023 and FY2025?",
  "What are the reported revenues of Reliance Industries in INR Crores?",
  "What percentage of surveyed investors prefer Mutual Funds for wealth creation?"
];

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchQueryResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunQuery = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    try {
      setLoading(true);
      const res = await api.executeResearchQuery({
        question: q,
        mode: "graph_rag"
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      setResult({
        question: q,
        mode: "data_layer_grounded",
        answer: "Not available in provided data.",
        keywords: [],
        seeds: [],
        seed_labels: [],
        triples: [],
        records: [],
        statistics: "",
        latency_ms: 0,
        grounding_confidence: "insufficient",
        linked_entities: [],
        records_detail: []
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent p-4 space-y-4 font-sans select-text overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
        <div>
          <h1 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
            <span>Ask the Data</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 font-normal">
              Grounded Citation
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query audited regulatory filings and verified survey data. Figures are strictly cited; missing data is refused.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 font-mono px-2.5 py-1 rounded bg-black/40 border border-white/[0.06]">
          Engine: <span className="text-slate-200 font-semibold">Strict Provenance RAG</span>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="metallic-surface rounded-xl p-4 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about revenue, margins, net income, cash flow, or survey allocations..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-black/50 border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="metallic-pill-active px-4 py-2.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md disabled:opacity-40"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Ask</span>
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mr-1">Suggested:</span>
          {DEFAULT_SUGGESTED_QUESTIONS.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuestion(sq);
                handleRunQuery(sq);
              }}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-all shadow-sm"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Answer & Provenance Output */}
      {result ? (
        <div className="space-y-4">
          <div className="metallic-surface rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-100">
                  Grounded Response
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Latency: {result.latency_ms}ms
                </span>
                <button
                  onClick={copyAnswer}
                  className="metallic-pill px-2.5 py-1 rounded text-[11px] text-slate-300 flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Answer Text */}
            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-black/20 p-3 rounded-lg border border-white/[0.04]">
              {result.answer}
            </div>
          </div>

          {/* Retrieved Sourced Data Points */}
          {result.records_detail && result.records_detail.length > 0 && (
            <div className="metallic-surface rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold font-display uppercase tracking-wider text-slate-200 mb-3">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                <span>Retrieved Data Rows ({result.records_detail.length})</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0b0e14]/80 text-slate-400 border-b border-white/[0.08] text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Ticker</th>
                      <th className="py-2 px-3">Metric</th>
                      <th className="py-2 px-3">Period</th>
                      <th className="py-2 px-3 text-right">Value</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3">Source File</th>
                      <th className="py-2 px-3">Row</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-[11px]">
                    {result.records_detail.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-2 px-3 text-slate-100 font-bold">{rec.ticker}</td>
                        <td className="py-2 px-3 text-slate-300">{rec.metric}</td>
                        <td className="py-2 px-3 text-slate-400">{rec.period}</td>
                        <td className="py-2 px-3 text-right text-slate-100 tabular-nums font-semibold">
                          {typeof rec.value === "number" ? rec.value.toLocaleString() : rec.value}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{rec.unit}</td>
                        <td className="py-2 px-3 text-slate-500 text-[10px] truncate max-w-[200px]">
                          {rec.source_file}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{rec.source_row}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 border border-white/[0.06] rounded-xl bg-black/20 text-center text-slate-500 text-xs">
          Select a suggested question above or type a financial query to inspect verified data.
        </div>
      )}
    </div>
  );
};
