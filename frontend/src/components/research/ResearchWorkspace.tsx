"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Send,
  Layers,
  Database,
  Clock,
  ShieldAlert,
  FileText,
  Copy,
  Check,
  Building2
} from "lucide-react";
import { api } from "@/services/api";
import { ResearchQueryResponse, CompanySummary } from "@/types";

interface ResearchWorkspaceProps {
  initialCompanyId?: string;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({ initialCompanyId }) => {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"graph_rag" | "tree_of_thought" | "plain_rag">("graph_rag");
  const [selectedEntity, setSelectedEntity] = useState<string>(initialCompanyId || "all");
  const [hops, setHops] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ResearchQueryResponse | null>(null);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [activeTab, setActiveTab] = useState<"answer" | "triples" | "statistics" | "records">("answer");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    api.getSuggestedQuestions().then(setSuggested).catch(console.error);
    api.getCompanies().then(setCompanies).catch(console.error);
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
        companyId: selectedEntity === "all" ? undefined : selectedEntity
      });
      setResult(res);
      setActiveTab("answer");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copySynthesis = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-[#080b11] select-text text-slate-200">
      {/* Left Query & Copilot Panel */}
      <div className="flex-1 flex flex-col h-full border-r border-[#1a2234] overflow-y-auto">
        {/* Workspace Header */}
        <div className="h-10 bg-[#0c1017] border-b border-[#1a2234] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-100 uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5 text-sky-400" />
            <span>GraphRAG Research Console</span>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-[#111622] border border-[#1a2234] rounded p-0.5 text-xs">
            <button
              onClick={() => setMode("graph_rag")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                mode === "graph_rag"
                  ? "bg-[#1a2234] text-sky-400 font-medium border border-sky-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              GraphRAG
            </button>
            <button
              onClick={() => setMode("tree_of_thought")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                mode === "tree_of_thought"
                  ? "bg-[#1a2234] text-slate-200 font-medium border border-slate-600"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tree-of-Thought
            </button>
            <button
              onClick={() => setMode("plain_rag")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                mode === "plain_rag"
                  ? "bg-[#1a2234] text-slate-300 font-medium border border-slate-600"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Vector Baseline
            </button>
          </div>
        </div>

        {/* Question Input Box */}
        <div className="p-3 bg-[#0c1017] border-b border-[#1a2234] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] text-slate-400">Entity Scope:</span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="bg-[#111622] border border-[#1a2234] text-slate-200 px-2 py-0.5 rounded text-[11px] focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Indexed Filers & Avenues</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ticker} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">BFS Hops:</span>
              <select
                value={hops}
                onChange={(e) => setHops(parseInt(e.target.value))}
                className="bg-[#111622] border border-[#1a2234] text-slate-200 px-2 py-0.5 rounded text-[11px] focus:outline-none"
              >
                <option value={1}>1 Hop (Direct Ties)</option>
                <option value={2}>2 Hops (Transitive)</option>
                <option value={3}>3 Hops (Systemic)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-[#080b11] border border-[#1a2234] rounded p-2 focus-within:border-sky-500 transition-colors">
              <textarea
                rows={2}
                placeholder="Submit inquiry [e.g. Compare Apple and Microsoft cloud/services margins, or explore risk factors]..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleRunQuery();
                  }
                }}
                className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={() => handleRunQuery()}
              disabled={loading || !question.trim()}
              className="px-3.5 bg-[#111622] hover:bg-[#1a2234] text-sky-400 border border-[#1a2234] hover:border-sky-500/50 rounded text-xs flex flex-col items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 mb-0.5" />
              <span className="text-[10px] font-semibold uppercase">EXEC</span>
            </button>
          </div>

          {/* Suggested Questions */}
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Curated Analytical Queries
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggested.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(sq);
                    handleRunQuery(sq);
                  }}
                  className="px-2 py-0.5 bg-[#111622] hover:bg-[#1a2234] border border-[#1a2234] rounded text-[10px] text-slate-300 hover:text-sky-300 text-left transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Execution Results View */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 space-y-2">
              <span className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs text-sky-400 font-semibold tracking-wide">
                TRAVERSING KNOWLEDGE GRAPH & SYNTHESIZING REASONING...
              </div>
              <div className="text-[11px] text-slate-500">
                Entity extraction → Seed linking → Multi-hop BFS → Statistical profile synthesis
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center p-16 text-center text-slate-500 space-y-2">
              <Brain className="w-8 h-8 text-slate-700" />
              <div className="text-xs font-semibold text-slate-400">READY FOR RESEARCH EXECUTION</div>
              <p className="text-[11px] max-w-sm text-slate-600 leading-relaxed">
                Query audited corporate disclosures, XBRL financial metrics, supply chain relationships,
                or empirical investor survey allocations.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-3">
              {/* Query Meta Bar */}
              <div className="flex items-center justify-between p-2 bg-[#0c1017] border border-[#1a2234] rounded text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>LATENCY: <strong className="text-slate-200 tabular-nums">{result.latency_ms} ms</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500">CONFIDENCE:</span>
                    <span
                      className={`font-semibold uppercase ${
                        result.grounding_confidence === "high"
                          ? "text-teal-400"
                          : result.grounding_confidence === "moderate"
                          ? "text-sky-400"
                          : "text-slate-400"
                      }`}
                    >
                      {result.grounding_confidence}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">ENGINE: </span>
                    <span className="text-sky-400 font-semibold uppercase">{result.mode.replace("_", " ")}</span>
                  </div>
                  <button
                    onClick={copySynthesis}
                    className="p-1 hover:bg-[#111622] rounded text-slate-400 hover:text-slate-200 border border-[#1a2234]"
                    title="Copy Answer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#1a2234] gap-1 text-xs">
                <button
                  onClick={() => setActiveTab("answer")}
                  className={`px-3 py-1 font-medium border-b-2 transition-colors ${
                    activeTab === "answer"
                      ? "border-sky-400 text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  SYNTHESIZED DOSSIER
                </button>
                <button
                  onClick={() => setActiveTab("triples")}
                  className={`px-3 py-1 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "triples"
                      ? "border-sky-400 text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>GRAPH TIES ({result.triples.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`px-3 py-1 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "statistics"
                      ? "border-sky-400 text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Database className="w-3 h-3" />
                  <span>DISTRIBUTIONS</span>
                </button>
                <button
                  onClick={() => setActiveTab("records")}
                  className={`px-3 py-1 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "records"
                      ? "border-sky-400 text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>FILING RECORDS ({result.records.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === "answer" && (
                <div className="bg-[#0c1017] border border-[#1a2234] rounded p-3.5 space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    EVIDENCE-GROUNDED RESEARCH SYNTHESIS
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {result.answer}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1a2234] text-[10px] text-slate-500 flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 text-sky-400 shrink-0" />
                    <span>
                      Grounded in {result.records.length} regulatory/survey source records & {result.triples.length} graph association triples.
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "triples" && (
                <div className="bg-[#0c1017] border border-[#1a2234] rounded p-3 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                    RETRIEVED ASSOCIATION EDGES (BFS TRAVERSAL)
                  </div>
                  {result.triples.length === 0 ? (
                    <div className="text-xs text-slate-500">No graph triples linked to query tokens.</div>
                  ) : (
                    <div className="space-y-1">
                      {result.triples.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-1.5 bg-[#111622] border border-[#1a2234] rounded text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200 font-semibold">{t.s}</span>
                            <span className="text-slate-500">──[{t.p}]──▶</span>
                            <span className="text-sky-400">{t.o}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px]">
                            <span className="text-slate-500">HOP {t.hop}</span>
                            <span className="text-slate-300 font-semibold">{t.count} pairs</span>
                            <span className="text-sky-400 font-semibold tabular-nums">{t.lift}x lift</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "statistics" && (
                <div className="bg-[#0c1017] border border-[#1a2234] rounded p-3 text-xs space-y-2 whitespace-pre-wrap">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    EXACT STATISTICAL DISTRIBUTIONS
                  </div>
                  <div className="bg-[#111622] border border-[#1a2234] p-2.5 rounded leading-relaxed text-slate-300 text-[11px]">
                    {result.statistics || "No statistical distribution matched."}
                  </div>
                </div>
              )}

              {activeTab === "records" && (
                <div className="bg-[#0c1017] border border-[#1a2234] rounded p-3 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    CITED REGULATORY & SURVEY EVIDENCE RECORDS
                  </div>
                  {result.records.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-[#111622] border border-[#1a2234] rounded text-[11px] text-slate-300 leading-relaxed"
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
      <div className="w-64 bg-[#0c1017] flex flex-col h-full overflow-y-auto shrink-0 select-text p-3 space-y-4 border-l border-[#1a2234]">
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
            EXTRACTED KEYWORDS
          </div>
          {result?.keywords?.length ? (
            <div className="flex flex-wrap gap-1">
              {result.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-[#111622] border border-[#1a2234] rounded text-[10px] text-sky-400"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-slate-600">None extracted yet</div>
          )}
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
            LINKED GRAPH SEEDS
          </div>
          {result?.seed_labels?.length ? (
            <div className="space-y-1">
              {result.seed_labels.map((sl, i) => (
                <div
                  key={i}
                  className="px-2 py-1 bg-[#111622] border border-[#1a2234] rounded text-[11px] text-slate-200"
                >
                  {sl}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-slate-600">None linked yet</div>
          )}
        </div>

        <div className="pt-3 border-t border-[#1a2234] space-y-1.5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">
            GRAPHRAG REASONING
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Multi-hop graph traversal links queries across tabular statements, risk disclosures, and
            demographic cohorts, preventing vector hallucination.
          </p>
        </div>
      </div>
    </div>
  );
};
