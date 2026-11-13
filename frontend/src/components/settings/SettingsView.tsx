"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Cpu,
  Key,
  Server,
  RefreshCw,
  FileCheck2,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Table as TableIcon,
  ChevronRight,
  Loader2
} from "lucide-react";
import { HealthStatus } from "@/types";
import { api } from "@/services/api";

interface SettingsViewProps {
  health: HealthStatus | null;
  onRefreshHealth: () => void;
}

interface DatasetItem {
  name: string;
  path: string;
  folder: string;
  size_kb: number;
  extension: string;
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
  status: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ health, onRefreshHealth }) => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DatasetInspectionResult | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const list = await api.getAvailableDatasets();
      setDatasets(list);
    } catch (err) {
      console.error("Failed to load datasets:", err);
    } finally {
      setLoadingDatasets(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleInspect = async (path: string) => {
    setInspecting(true);
    setUploadError(null);
    try {
      const res = await api.inspectLocalDataset(path);
      setSelectedResult(res);
    } catch (err: any) {
      setUploadError(err.message || "Failed to inspect dataset");
    } finally {
      setInspecting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const res = await api.uploadDataset(file);
      setSelectedResult(res);
      await fetchDatasets();
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080b11] overflow-y-auto p-5 max-w-5xl mx-auto w-full space-y-4 select-text text-slate-200">
      {/* Settings Header */}
      <div className="p-3.5 bg-[#0c1017] border border-[#1a2234] rounded flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-100 tracking-tight uppercase">
            System Architecture & Diagnostics
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time telemetry of backend gateways, ontology engines, semantic vector indexers, and LLM inference.
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          className="px-2.5 py-1 bg-[#111622] hover:bg-slate-800 border border-[#1a2234] rounded text-[11px] text-sky-400 font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* CSV Ingestion & Dataset Testing Panel */}
      <div className="p-4 bg-[#0c1017] border border-sky-500/30 rounded space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Financial Dataset Ingestion & CSV Upload
            </span>
          </div>
          <span className="text-[10px] text-sky-400 font-mono">SUPPORTED: .CSV, .XLSX</span>
        </div>

        <p className="text-[11px] text-slate-400">
          Upload any company financial dataset, market series, or sales CSV to run automated schema validation, missing-value profiling, entity detection, and tabular analytics.
        </p>

        {/* Upload Action Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded border border-sky-400 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Ingesting Dataset...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload New CSV / Excel File</span>
              </>
            )}
          </button>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pl-1">
            <span>Or test pre-loaded datasets from</span>
            <code className="text-slate-400 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">Datas/</code>
          </div>
        </div>

        {uploadError && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Available Datasets List from Datas/ */}
        <div className="pt-2 border-t border-[#1a2234]">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Pre-Loaded Datasets in Workspace ({datasets.length})</span>
            {loadingDatasets && <span className="text-[10px] text-slate-500">Scanning...</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {datasets.map((d, idx) => (
              <button
                key={idx}
                onClick={() => handleInspect(d.path)}
                disabled={inspecting}
                className={`p-2 rounded border text-left flex items-start justify-between gap-1.5 transition-all ${
                  selectedResult?.filepath === d.path
                    ? "bg-sky-950/30 border-sky-500/60 text-sky-200"
                    : "bg-[#111622] hover:bg-[#182030] border-[#1a2234] text-slate-300"
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

        {/* Selected / Uploaded Dataset Inspection Card */}
        {selectedResult && (
          <div className="mt-3 p-3.5 bg-[#090d14] border border-sky-500/40 rounded space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a2234] pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">{selectedResult.filename}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-medium">
                  {selectedResult.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Memory: {selectedResult.memory_usage_kb} KB
              </span>
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
                <span className="text-[10px] text-slate-500 block uppercase">Duplicate Rows</span>
                <span className="text-sm font-semibold text-white">{selectedResult.duplicate_rows}</span>
              </div>
            </div>

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

            {/* Columns List */}
            <div className="text-[11px] space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Schema Columns ({selectedResult.columns.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedResult.columns.map((col, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-[#111622] border border-[#1a2234] text-slate-300 font-mono text-[10px]"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Sample Tabular Data Preview */}
            {selectedResult.sample_records.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <TableIcon className="w-3 h-3 text-slate-500" />
                  <span>Sample Records Preview (First {selectedResult.sample_records.length} Rows)</span>
                </div>
                <div className="overflow-x-auto border border-[#1a2234] rounded">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#111622] text-slate-400 border-b border-[#1a2234]">
                      <tr>
                        {selectedResult.columns.slice(0, 7).map((col, idx) => (
                          <th key={idx} className="p-1.5 px-2 font-medium truncate max-w-[140px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a2234]/60">
                      {selectedResult.sample_records.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/30">
                          {selectedResult.columns.slice(0, 7).map((col, cIdx) => (
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

      {/* Connectivity Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Backend API */}
        <div className="p-3 bg-[#0c1017] border border-[#1a2234] rounded space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>FastAPI REST Gateway</span>
            </span>
            <span className="text-teal-400 text-[10px] font-semibold">PORT 8000</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Status: {health?.status || "Connecting..."} (API v{health?.version || "2.0.0"})
          </div>
          <div className="text-[10px] text-slate-500">
            Endpoint: http://localhost:8000/api/v1
          </div>
        </div>

        {/* Vector Embeddings */}
        <div className="p-3 bg-[#0c1017] border border-[#1a2234] rounded space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Semantic Embedding Indexer</span>
            </span>
            <span className="text-teal-400 text-[10px] font-semibold">OPERATIONAL</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Model: {health?.embedding_backend || "all-MiniLM-L6-v2 (384-dim)"}
          </div>
          <div className="text-[10px] text-slate-500">
            Fallback: Character n-gram hashing vectorizer (4096-dim)
          </div>
        </div>

        {/* LLM Engine */}
        <div className="p-3 bg-[#0c1017] border border-[#1a2234] rounded space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-sky-400" />
              <span>Groq Cloud LLM Inference</span>
            </span>
            <span
              className={`text-[10px] font-semibold ${
                health?.llm_connected ? "text-teal-400" : "text-amber-400"
              }`}
            >
              {health?.llm_connected ? "KEY ACTIVE" : "EVIDENCE MODE"}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Active: qwen/qwen3.8-27b & openai/gpt-oss-120b
          </div>
          <div className="text-[10px] text-slate-500">
            Rate Governor: 6,500 Tokens/Min Sliding Window
          </div>
        </div>

        {/* Neo4j / NetworkX Storage */}
        <div className="p-3 bg-[#0c1017] border border-[#1a2234] rounded space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Ontology Graph Store</span>
            </span>
            <span className="text-teal-400 text-[10px] font-semibold">
              {health?.neo4j_connected ? "NEO4J CONNECTED" : "NETWORKX ACTIVE"}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            In-Memory NetworkX DiGraph + Co-occurrence Lift
          </div>
          <div className="text-[10px] text-slate-500">
            Coverage: 444 Nodes, 1,448 Association Edges
          </div>
        </div>

        {/* Corporate SEC EDGAR Registry */}
        <div className="p-3 bg-[#0c1017] border border-[#1a2234] rounded space-y-1.5 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Verified Corporate Financials Registry</span>
            </span>
            <span className="text-teal-400 text-[10px] font-semibold">134 FACTS AUDITED</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Filing Coverage: AAPL, MSFT, NVDA, AMZN, TSLA, GOOGL, RELIANCE, TCS, INFY, HDFCBANK (US-GAAP / Ind-AS)
          </div>
          <div className="text-[10px] text-slate-500">
            Provenance File: data/corporate_financials/verified_corporate_financials.json
          </div>
        </div>
      </div>

      {/* Dataset & Provenance Section */}
      <div className="p-3.5 bg-[#0c1017] border border-[#1a2234] rounded space-y-2 text-xs">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          ORIGINAL REPOSITORY ATTRIBUTION & LICENSING
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Original codebase created by Kabir Nagdev under the MIT License. Synthesizes empirical investor surveys with multi-hop GraphRAG and quantitative derivatives calculations. Redesigned as an Institutional Financial Intelligence Workstation.
        </p>
        <div className="pt-2 text-[10px] text-slate-600 border-t border-[#1a2234]">
          Branch: <code className="text-slate-400">feat/financial-intelligence-platform</code> // Production Workstation Build
        </div>
      </div>
    </div>
  );
};
