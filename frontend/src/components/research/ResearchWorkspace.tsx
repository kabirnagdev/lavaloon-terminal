"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Send,
  Sparkles,
  Layers,
  Database,
  Clock,
  ShieldAlert,
  ChevronRight,
  FileText,
  HelpCircle
} from "lucide-react";
import { api } from "@/services/api";
import { ResearchQueryResponse } from "@/types";

interface ResearchWorkspaceProps {
  initialCompanyId?: string;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({ initialCompanyId }) => {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"graph_rag" | "tree_of_thought" | "plain_rag">("graph_rag");
  const [hops, setHops] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ResearchQueryResponse | null>(null);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"answer" | "triples" | "statistics" | "records">("answer");

  useEffect(() => {
    api.getSuggestedQuestions().then(setSuggested).catch(console.error);
  }, []);

  const handleRunQuery = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    try {
      setLoading(true);
      const res = await api.executeResearchQuery({
        question: q,
        hops: hops,
        mode: mode,
        companyId: initialCompanyId
      });
      setResult(res);
      setActiveTab("answer");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-terminal-bg select-text">
      {/* Left Query & Copilot Panel */}
      <div className="flex-1 flex flex-col h-full terminal-border-r overflow-y-auto">
        {/* Workspace Header */}
        <div className="h-11 bg-terminal-surface terminal-border-b px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Brain className="w-4 h-4 text-sky-400" />
            <span>GraphRAG Research Copilot</span>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-md p-0.5 text-xs">
            <button
              onClick={() => setMode("graph_rag")}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === "graph_rag"
                  ? "bg-sky-500/20 text-sky-400 font-medium border border-sky-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              GraphRAG
            </button>
            <button
              onClick={() => setMode("tree_of_thought")}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === "tree_of_thought"
                  ? "bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tree-of-Thought
            </button>
            <button
              onClick={() => setMode("plain_rag")}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === "plain_rag"
                  ? "bg-slate-800 text-white font-medium border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Vector Baseline
            </button>
          </div>
        </div>

        {/* Question Input Box */}
        <div className="p-4 bg-terminal-surface terminal-border-b space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">Financial Research Inquiry</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Expansion Hops:</span>
              <select
                value={hops}
                onChange={(e) => setHops(parseInt(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-0.5 rounded text-xs focus:outline-none"
              >
                <option value={1}>1 Hop</option>
                <option value={2}>2 Hops</option>
                <option value={3}>3 Hops</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-terminal-bg terminal-border rounded-lg p-2.5 focus-within:border-sky-500 transition-colors">
              <textarea
                rows={2}
                placeholder="Ask financial questions [e.g. What kind of investors prefer Mutual Funds, and what else do they choose?]..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleRunQuery();
                  }
                }}
                className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={() => handleRunQuery()}
              disabled={loading || !question.trim()}
              className="px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium rounded-lg flex flex-col items-center justify-center transition-all disabled:opacity-50 shadow-sm"
            >
              <Send className="w-4 h-4 mb-0.5" />
              <span className="text-[11px] font-medium">Execute</span>
            </button>
          </div>

          {/* Suggested Questions Carousel */}
          <div>
            <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Suggested Analytical Inquiries</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggested.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(sq);
                    handleRunQuery(sq);
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-md text-[11px] text-slate-300 hover:text-sky-300 text-left transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Execution Results View */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <span className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs font-semibold text-sky-400 tracking-wide">
                Traversing Knowledge Graph & Synthesizing Reasoning...
              </div>
              <div className="text-xs text-slate-400">
                Entity extraction → Seed linking → Multi-hop BFS → Statistical profile synthesis
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center p-16 text-center text-slate-500 space-y-2">
              <Brain className="w-10 h-10 text-slate-700" />
              <div className="text-xs font-semibold text-slate-400">Ready to Execute GraphRAG Research</div>
              <p className="text-xs max-w-sm text-slate-500 leading-relaxed">
                Query investor risk attitudes, preference correlations, or empirical portfolio
                allocations across surveyed demographics.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* Query Meta Bar */}
              <div className="flex items-center justify-between p-2.5 bg-terminal-surface terminal-border rounded-lg text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Latency: <strong className="font-mono text-slate-200 tabular-nums">{result.latency_ms} ms</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Confidence:</span>
                    <span
                      className={`font-semibold capitalize ${
                        result.grounding_confidence === "high"
                          ? "text-emerald-400"
                          : result.grounding_confidence === "moderate"
                          ? "text-amber-400"
                          : "text-slate-400"
                      }`}
                    >
                      {result.grounding_confidence}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-slate-500">Pipeline:</span>
                  <span className="text-sky-400 font-mono capitalize">{result.mode.replace("_", " ")}</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-terminal-border gap-2 text-xs">
                <button
                  onClick={() => setActiveTab("answer")}
                  className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
                    activeTab === "answer"
                      ? "border-sky-400 text-sky-400 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Synthesized Answer
                </button>
                <button
                  onClick={() => setActiveTab("triples")}
                  className={`px-3 py-1.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "triples"
                      ? "border-sky-400 text-sky-400 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Graph Triples ({result.triples.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`px-3 py-1.5 text-xs font-mono font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "statistics"
                      ? "border-terminal-cyan text-terminal-cyan"
                      : "border-transparent text-terminal-muted hover:text-terminal-text"
                  }`}
                >
                  <Database className="w-3 h-3" />
                  <span>EXACT STATISTICS</span>
                </button>
                <button
                  onClick={() => setActiveTab("records")}
                  className={`px-3 py-1.5 text-xs font-mono font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "records"
                      ? "border-terminal-cyan text-terminal-cyan"
                      : "border-transparent text-terminal-muted hover:text-terminal-text"
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>RECORDS ({result.records.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === "answer" && (
                <div className="bg-terminal-surface terminal-border rounded p-4 space-y-3">
                  <div className="text-xs font-mono font-bold text-terminal-dim uppercase tracking-wider">
                    EVIDENCE-GROUNDED RESEARCH SYNTHESIS
                  </div>
                  <div className="text-xs font-mono text-terminal-text leading-relaxed whitespace-pre-wrap">
                    {result.answer}
                  </div>

                  <div className="mt-4 pt-3 terminal-border-t text-[11px] font-mono text-terminal-dim flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-terminal-amber shrink-0" />
                    <span>
                      Grounded in {result.records.length} empirical survey observations & {result.triples.length} graph association triples.
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "triples" && (
                <div className="bg-terminal-surface terminal-border rounded p-3 space-y-2">
                  <div className="text-[11px] font-mono text-terminal-dim uppercase mb-2">
                    RETRIEVED ASSOCIATION EDGES (BFS TRAVERSAL)
                  </div>
                  {result.triples.length === 0 ? (
                    <div className="text-xs font-mono text-terminal-muted">No graph triples linked to query.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {result.triples.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-terminal-panel terminal-border rounded text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-terminal-cyan font-bold">{t.s}</span>
                            <span className="text-terminal-dim">──[{t.p}]──▶</span>
                            <span className="text-terminal-amber">{t.o}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-terminal-muted">HOP {t.hop}</span>
                            <span className="text-terminal-green font-bold">{t.count} pairs</span>
                            <span className="text-terminal-amber font-bold">{t.lift}x lift</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "statistics" && (
                <div className="bg-terminal-surface terminal-border rounded p-4 font-mono text-xs text-terminal-text space-y-2 whitespace-pre-wrap">
                  <div className="text-[11px] text-terminal-dim uppercase font-bold">
                    AGGREGATE DATASET PROFILES
                  </div>
                  <div className="bg-terminal-bg terminal-border p-3 rounded leading-relaxed text-terminal-muted">
                    {result.statistics || "No statistical distribution matched."}
                  </div>
                </div>
              )}

              {activeTab === "records" && (
                <div className="bg-terminal-surface terminal-border rounded p-3 space-y-2">
                  <div className="text-[11px] font-mono text-terminal-dim uppercase mb-1">
                    CITED SURVEY OBSERVATIONS
                  </div>
                  {result.records.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-terminal-panel terminal-border rounded text-[11px] font-mono text-terminal-muted leading-relaxed"
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Seeds & Keywords Sidebar */}
      <div className="w-72 bg-terminal-surface flex flex-col h-full overflow-y-auto shrink-0 select-text p-3 space-y-4">
        <div>
          <div className="text-[10px] font-mono text-terminal-dim uppercase font-bold mb-2">
            EXTRACTED KEYWORDS
          </div>
          {result?.keywords?.length ? (
            <div className="flex flex-wrap gap-1">
              {result.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-terminal-panel terminal-border rounded text-[11px] font-mono text-terminal-cyan"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[11px] font-mono text-terminal-dim">None extracted yet</div>
          )}
        </div>

        <div>
          <div className="text-[10px] font-mono text-terminal-dim uppercase font-bold mb-2">
            LINKED GRAPH SEEDS
          </div>
          {result?.seed_labels?.length ? (
            <div className="space-y-1">
              {result.seed_labels.map((sl, i) => (
                <div
                  key={i}
                  className="px-2 py-1 bg-terminal-panel terminal-border rounded text-[11px] font-mono text-terminal-amber"
                >
                  {sl}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] font-mono text-terminal-dim">None linked yet</div>
          )}
        </div>

        <div className="pt-3 terminal-border-t space-y-2">
          <div className="text-[10px] font-mono text-terminal-dim uppercase font-bold">
            GRAPHRAG ARCHITECTURE
          </div>
          <p className="text-[10px] font-mono text-terminal-muted leading-relaxed">
            Standard vector search fails on tabular relational queries. GraphRAG overcomes this by linking
            query tokens to knowledge graph entities, expanding via statistical lift associations, and
            combining exact aggregate statistics before LLM answer synthesis.
          </p>
        </div>
      </div>
    </div>
  );
};

