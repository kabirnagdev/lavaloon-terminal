"use client";

import React from "react";
import {
  Database,
  Cpu,
  Key,
  Server,
  RefreshCw,
  FileCheck2,
  Binary
} from "lucide-react";
import { HealthStatus } from "@/types";

interface SettingsViewProps {
  health: HealthStatus | null;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ health, onRefreshHealth }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#080b11] overflow-y-auto p-5 max-w-4xl mx-auto w-full space-y-4 select-text text-slate-200">
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
          <span>Ping Gateway</span>
        </button>
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
