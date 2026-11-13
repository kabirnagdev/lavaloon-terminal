"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Table as TableIcon,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowRight,
  BarChart3,
  Share2
} from "lucide-react";
import { api } from "@/services/api";

interface DataIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCopilot?: () => void;
  onNavigateToGraph?: () => void;
}

interface DatasetItem {
  name: string;
  path: string;
  folder: string;
  size_kb: number;
  extension: string;
}

interface ChartPreviewItem {
  label: string;
  value: number;
}

interface ChartPreview {
  title: string;
  column: string;
  metric: string;
  type: string;
  items: ChartPreviewItem[];
}

interface DatasetInspectionResult {
  filename: string;
  filepath: string;
  rows: number;
  columns: string[];
  column_count: number;
  null_cells: number;
  null_percentage: number;
  duplicate_rows: number;
  memory_usage_kb: number;
  detected_entities: string[];
  sample_records: Record<string, any>[];
  chart_preview?: ChartPreview | null;
  status: string;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({
  isOpen,
  onClose,
  onNavigateToCopilot,
  onNavigateToGraph
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "paste" | "workspace">("upload");
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DatasetInspectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activatingGraph, setActivatingGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paste state
  const [contextTitle, setContextTitle] = useState("");
  const [rawText, setRawText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingDatasets(true);
      api.getAvailableDatasets()
        .then(setDatasets)
        .catch(console.error)
        .finally(() => setLoadingDatasets(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadDataset(file);
      setSelectedResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to upload dataset");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInspectDataset = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.inspectLocalDataset(path);
      setSelectedResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to inspect dataset");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateGraph = async () => {
    if (!selectedResult) return;
    setActivatingGraph(true);
    setError(null);
    try {
      await api.activateDatasetGraph(selectedResult.filepath);
      onClose();
      if (onNavigateToGraph) {
        onNavigateToGraph();
      }
    } catch (err: any) {
      setError(err.message || "Failed to activate dataset in graph");
    } finally {
      setActivatingGraph(false);
    }
  };

  const handleIngestRawContext = async () => {
    if (!rawText.trim()) {
      setError("Please paste some context data or CSV text first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.ingestRawContext({
        title: contextTitle.trim() || "custom_context_data.csv",
        content: rawText
      });
      setSelectedResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to ingest raw context");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-text font-sans">
      <div className="metallic-surface rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200 border border-white/10">
        {/* Modal Header */}
        <div className="p-3.5 px-4 bg-metallic-header border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg metallic-pill flex items-center justify-center text-sky-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-white tracking-wide">
                Ingest New Data & Context
              </h2>
              <p className="text-[11px] text-slate-400">
                Upload CSV, paste custom company data/context, or test pre-loaded datasets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ingestion Mode Tabs */}
        <div className="flex border-b border-white/[0.06] bg-black/30 px-4 gap-2 text-xs font-display">
          <button
            onClick={() => setActiveTab("upload")}
            className={`py-2 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "upload"
                ? "border-sky-400 text-sky-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload CSV / Excel</span>
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`py-2 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "paste"
                ? "border-sky-400 text-sky-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Context / Raw Data</span>
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`py-2 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "workspace"
                ? "border-sky-400 text-sky-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Pre-Loaded Datas ({datasets.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: File Upload */}
          {activeTab === "upload" && (
            <div className="p-6 bg-[#0e1422] border-2 border-dashed border-[#1e293b] hover:border-sky-500/50 rounded-lg text-center space-y-3 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center border border-sky-500/20">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-200">
                  Select or drop a CSV or Excel file to analyze
                </p>
                <p className="text-[10px] text-slate-500">
                  Supports .csv, .xlsx, .xls financial statements, surveys, and market logs
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded border border-sky-400 inline-flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>{loading ? "Analyzing..." : "Choose File to Test"}</span>
              </button>
            </div>
          )}

          {/* TAB 2: Paste Raw Context */}
          {activeTab === "paste" && (
            <div className="space-y-2.5 bg-[#0e1422] p-4 border border-[#1a2234] rounded-lg">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Context / Dataset Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3_Earnings_Amazon.csv or Custom_Survey_Notes"
                  value={contextTitle}
                  onChange={(e) => setContextTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#080b11] border border-[#1a2234] rounded text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Context Text / CSV Tabular Content
                </label>
                <textarea
                  rows={6}
                  placeholder={`Paste CSV data or context here, e.g.:\nCompany,Revenue,Net_Income,Fiscal_Year\nAcme Corp,12000000,3200000,2024\nBeta Tech,45000000,8900000,2024`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#080b11] border border-[#1a2234] rounded text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/60 font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleIngestRawContext}
                  disabled={loading || !rawText.trim()}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded border border-sky-400 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Ingest & Test Context</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Pre-loaded Datasets */}
          {activeTab === "workspace" && (
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Available Datasets in Workspace (Click to Inspect)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {datasets.map((d, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInspectDataset(d.path)}
                    disabled={loading}
                    className={`p-2 rounded border text-left flex items-start justify-between gap-1.5 transition-all ${
                      selectedResult?.filepath === d.path
                        ? "bg-sky-950/40 border-sky-500/70 text-sky-200"
                        : "bg-[#0e1422] hover:bg-[#151e30] border-[#1a2234] text-slate-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="text-xs font-medium truncate">{d.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {d.folder} &bull; {d.size_kb} KB
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {selectedResult && (
            <div className="p-3.5 bg-[#090d14] border border-sky-500/40 rounded-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a2234] pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">{selectedResult.filename}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-medium">
                    {selectedResult.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateToGraph && (
                    <button
                      onClick={handleActivateGraph}
                      disabled={activatingGraph}
                      className="text-[10px] px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/80 text-emerald-300 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {activatingGraph ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Share2 className="w-3 h-3 text-emerald-400" />
                      )}
                      <span>Open in Relationship Graph</span>
                    </button>
                  )}

                  {onNavigateToCopilot && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToCopilot();
                      }}
                      className="text-[10px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 rounded flex items-center gap-1 transition-colors"
                    >
                      <span>Query in Copilot</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-[#0c1017] border border-[#1a2234] rounded">
                  <span className="text-[10px] text-slate-500 block uppercase">Total Rows</span>
                  <span className="text-sm font-semibold text-white">{selectedResult.rows.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-[#0c1017] border border-[#1a2234] rounded">
                  <span className="text-[10px] text-slate-500 block uppercase">Columns</span>
                  <span className="text-sm font-semibold text-white">{selectedResult.column_count}</span>
                </div>
                <div className="p-2 bg-[#0c1017] border border-[#1a2234] rounded">
                  <span className="text-[10px] text-slate-500 block uppercase">Missing Cells</span>
                  <span className="text-sm font-semibold text-white">
                    {selectedResult.null_cells} ({selectedResult.null_percentage}%)
                  </span>
                </div>
                <div className="p-2 bg-[#0c1017] border border-[#1a2234] rounded">
                  <span className="text-[10px] text-slate-500 block uppercase">Duplicates</span>
                  <span className="text-sm font-semibold text-white">{selectedResult.duplicate_rows}</span>
                </div>
              </div>

              {/* Visual Distribution Chart for Uploaded Data */}
              {selectedResult.chart_preview && selectedResult.chart_preview.items.length > 0 && (
                <div className="p-3 bg-[#0c1017] border border-[#1a2234] rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{selectedResult.chart_preview.title}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Metric: {selectedResult.chart_preview.metric}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {(() => {
                      const items = selectedResult.chart_preview.items;
                      const maxVal = Math.max(...items.map((i) => i.value), 1);
                      return items.map((item, idx) => {
                        const pct = Math.max(4, Math.round((item.value / maxVal) * 100));
                        return (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-300 truncate max-w-[240px]" title={item.label}>
                                {item.label}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {item.value >= 1_000_000_000
                                  ? `${(item.value / 1_000_000_000).toFixed(1)}B`
                                  : item.value >= 1_000_000
                                  ? `${(item.value / 1_000_000).toFixed(1)}M`
                                  : item.value.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-sm overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-sm transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Detected Entities */}
              {selectedResult.detected_entities.length > 0 && (
                <div className="text-[11px] space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Detected Entities / Categories
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedResult.detected_entities.map((ent, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-sky-300 text-[10px]"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Tabular Data Preview */}
              {selectedResult.sample_records.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <TableIcon className="w-3 h-3 text-slate-500" />
                    <span>Sample Records Preview</span>
                  </div>
                  <div className="overflow-x-auto border border-[#1a2234] rounded max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#111622] text-slate-400 border-b border-[#1a2234] sticky top-0">
                        <tr>
                          {selectedResult.columns.slice(0, 6).map((col, idx) => (
                            <th key={idx} className="p-1.5 px-2 font-medium truncate max-w-[140px]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a2234]/60">
                        {selectedResult.sample_records.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/30">
                            {selectedResult.columns.slice(0, 6).map((col, cIdx) => (
                              <td key={cIdx} className="p-1.5 px-2 text-slate-300 truncate max-w-[140px]">
                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

